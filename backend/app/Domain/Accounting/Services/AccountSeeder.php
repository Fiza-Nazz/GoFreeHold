<?php

namespace App\Domain\Accounting\Services;

use App\Domain\Accounting\Models\ChartAccount;
use Illuminate\Support\Facades\DB;

class AccountSeeder
{
    /**
     * Seed default Chart of Accounts for a specific organization.
     * Idempotent: Does not duplicate accounts if code already exists in that organization.
     *
     * @param int $organizationId
     * @return array<ChartAccount>
     */
    public function seedForOrganization(int $organizationId): array
    {
        return DB::transaction(function () use ($organizationId) {
            // Step 1: Define and create GROUP accounts (folders)
            $groupsDef = [
                ['code' => '1000', 'name' => 'Current Assets', 'type' => 'asset', 'dr_cr' => 'DR'],
                ['code' => '2000', 'name' => 'Current Liabilities', 'type' => 'liability', 'dr_cr' => 'CR'],
                ['code' => '3000', 'name' => 'Equity', 'type' => 'equity', 'dr_cr' => 'CR'],
                ['code' => '4000', 'name' => 'Revenue', 'type' => 'revenue', 'dr_cr' => 'CR'],
                ['code' => '6000', 'name' => 'Operating Expenses', 'type' => 'expense', 'dr_cr' => 'DR'],
            ];

            $createdGroups = [];
            foreach ($groupsDef as $g) {
                $account = ChartAccount::firstOrCreate(
                    [
                        'organization_id' => $organizationId,
                        'code'            => $g['code'],
                    ],
                    [
                        'name'           => $g['name'],
                        'type'           => $g['type'],
                        'account_header' => null,
                        'parent_coa'     => '0',
                        'description'    => 'GROUP',
                        'dr_cr'          => $g['dr_cr'],
                        'is_cash'        => false,
                        'status'         => 'ACTIVE',
                    ]
                );
                $createdGroups[$g['code']] = $account;
            }

            // Step 2: Define and create child LEDGER accounts
            $ledgersDef = [
                // Assets under 1000
                ['code' => '1100', 'name' => 'Cash', 'type' => 'asset', 'parent_code' => '1000', 'account_header' => 'Bank & Cash', 'is_cash' => true, 'dr_cr' => 'DR'],
                ['code' => '1200', 'name' => 'Bank', 'type' => 'asset', 'parent_code' => '1000', 'account_header' => 'Bank & Cash', 'is_cash' => true, 'dr_cr' => 'DR'],
                ['code' => '1300', 'name' => 'Rent Receivable', 'type' => 'asset', 'parent_code' => '1000', 'account_header' => 'Current Assets', 'is_cash' => false, 'dr_cr' => 'DR'],
                ['code' => '1400', 'name' => 'Other Receivable', 'type' => 'asset', 'parent_code' => '1000', 'account_header' => 'Current Assets', 'is_cash' => false, 'dr_cr' => 'DR'],

                // Liabilities under 2000
                ['code' => '2100', 'name' => 'Tenant Security Deposits', 'type' => 'liability', 'parent_code' => '2000', 'account_header' => 'Current Liabilities', 'is_cash' => false, 'dr_cr' => 'CR'],
                ['code' => '2200', 'name' => 'DEWA / Utility Liability', 'type' => 'liability', 'parent_code' => '2000', 'account_header' => 'Current Liabilities', 'is_cash' => false, 'dr_cr' => 'CR'],
                ['code' => '2300', 'name' => 'Accounts Payable', 'type' => 'liability', 'parent_code' => '2000', 'account_header' => 'Current Liabilities', 'is_cash' => false, 'dr_cr' => 'CR'],

                // Equity under 3000
                ['code' => '3100', 'name' => 'Owner Capital / Retained Earnings', 'type' => 'equity', 'parent_code' => '3000', 'account_header' => 'Equity', 'is_cash' => false, 'dr_cr' => 'CR'],

                // Revenue under 4000
                ['code' => '4100', 'name' => 'Rental Income', 'type' => 'revenue', 'parent_code' => '4000', 'account_header' => 'Revenue', 'is_cash' => false, 'dr_cr' => 'CR'],
                ['code' => '4200', 'name' => 'Service Charge Income', 'type' => 'revenue', 'parent_code' => '4000', 'account_header' => 'Revenue', 'is_cash' => false, 'dr_cr' => 'CR'],
                ['code' => '4300', 'name' => 'Other Income', 'type' => 'revenue', 'parent_code' => '4000', 'account_header' => 'Revenue', 'is_cash' => false, 'dr_cr' => 'CR'],

                // Expenses under 6000
                ['code' => '6100', 'name' => 'Maintenance Expense', 'type' => 'expense', 'parent_code' => '6000', 'account_header' => 'Expenses', 'is_cash' => false, 'dr_cr' => 'DR'],
                ['code' => '6200', 'name' => 'Admin / Other Expense', 'type' => 'expense', 'parent_code' => '6000', 'account_header' => 'Expenses', 'is_cash' => false, 'dr_cr' => 'DR'],
            ];

            $allAccounts = array_values($createdGroups);

            foreach ($ledgersDef as $l) {
                $parentGroup = $createdGroups[$l['parent_code']] ?? null;
                $parentIdStr = $parentGroup ? (string) $parentGroup->id : '0';

                $account = ChartAccount::firstOrCreate(
                    [
                        'organization_id' => $organizationId,
                        'code'            => $l['code'],
                    ],
                    [
                        'name'           => $l['name'],
                        'type'           => $l['type'],
                        'account_header' => $l['account_header'],
                        'parent_coa'     => $parentIdStr,
                        'description'    => 'LEDGER',
                        'dr_cr'          => $l['dr_cr'],
                        'is_cash'        => $l['is_cash'],
                        'status'         => 'ACTIVE',
                    ]
                );

                $allAccounts[] = $account;
            }

            return $allAccounts;
        });
    }

    /**
     * Find standard account by code for an organization, auto-seeding if empty.
     */
    public function getAccountByCode(int $organizationId, string $code): ?ChartAccount
    {
        $account = ChartAccount::where('organization_id', $organizationId)
            ->where('code', $code)
            ->first();

        if (!$account) {
            $this->seedForOrganization($organizationId);
            $account = ChartAccount::where('organization_id', $organizationId)
                ->where('code', $code)
                ->first();
        }

        return $account;
    }
}
