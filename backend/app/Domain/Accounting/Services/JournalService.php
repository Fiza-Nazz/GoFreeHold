<?php

namespace App\Domain\Accounting\Services;

use App\Domain\Accounting\Models\AccountingTransaction;
use App\Domain\Accounting\Models\ChartAccount;
use App\Domain\Accounting\Models\Ledger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JournalService
{
    /**
     * Post a balanced journal entry into General Ledger.
     *
     * @param int $organizationId
     * @param string $date (Y-m-d)
     * @param string $description
     * @param array<JournalLine|array> $lines
     * @param string|null $sourceType
     * @param int|null $sourceId
     * @param int|null $ownerId
     * @param int|null $contractId
     * @param int|null $propertyId
     * @param int|null $unitId
     * @param int|null $createdBy
     * @param string $status ('COMPLETED' or 'PENDING')
     * @return AccountingTransaction
     * @throws ValidationException
     */
    public function post(
        int $organizationId,
        string $date,
        string $description,
        array $lines,
        ?string $sourceType = null,
        ?int $sourceId = null,
        ?int $ownerId = null,
        ?int $contractId = null,
        ?int $propertyId = null,
        ?int $unitId = null,
        ?int $createdBy = null,
        string $status = 'COMPLETED'
    ): AccountingTransaction {
        // 1. Require >= 2 lines
        if (count($lines) < 2) {
            throw ValidationException::withMessages([
                'lines' => ['A journal transaction must contain at least 2 lines.'],
            ]);
        }

        $parsedLines = [];
        $totalDebit = '0';
        $totalCredit = '0';

        // 2. Parse and validate each line
        foreach ($lines as $idx => $line) {
            $accountId = $line instanceof JournalLine ? $line->chartAccountId : (int) ($line['chartaccount_id'] ?? $line['chart_account_id'] ?? 0);
            $debitStr = $line instanceof JournalLine ? (string) $line->debit : (string) ($line['debit'] ?? '0');
            $creditStr = $line instanceof JournalLine ? (string) $line->credit : (string) ($line['credit'] ?? '0');

            $debitVal = (float) $debitStr;
            $creditVal = (float) $creditStr;

            if ($debitVal < 0 || $creditVal < 0) {
                throw ValidationException::withMessages([
                    "lines.{$idx}" => ['Debit and credit amounts cannot be negative.'],
                ]);
            }

            if ($debitVal > 0 && $creditVal > 0) {
                throw ValidationException::withMessages([
                    "lines.{$idx}" => ['A single line cannot have both debit and credit amounts.'],
                ]);
            }

            if ($debitVal === 0.0 && $creditVal === 0.0) {
                throw ValidationException::withMessages([
                    "lines.{$idx}" => ['A journal line must specify a non-zero debit or credit amount.'],
                ]);
            }

            $totalDebit = $this->addDecimals($totalDebit, $debitStr);
            $totalCredit = $this->addDecimals($totalCredit, $creditStr);

            $parsedLines[] = [
                'chartaccount_id' => $accountId,
                'debit'           => number_format($debitVal, 4, '.', ''),
                'credit'          => number_format($creditVal, 4, '.', ''),
            ];
        }

        // 3. Balance check: SUM(debit) == SUM(credit)
        if ($this->compareDecimals($totalDebit, $totalCredit, 4) !== 0) {
            throw ValidationException::withMessages([
                'lines' => ["Journal does not balance. Total Debit ({$totalDebit}) must equal Total Credit ({$totalCredit})."],
            ]);
        }

        // 4. Verify accounts: scoped to organization, must be LEDGER and ACTIVE
        $accountIds = array_column($parsedLines, 'chartaccount_id');
        $accounts = ChartAccount::where('organization_id', $organizationId)
            ->whereIn('id', $accountIds)
            ->get()
            ->keyBy('id');

        foreach ($parsedLines as $idx => $pl) {
            $accId = $pl['chartaccount_id'];
            if (!$accounts->has($accId)) {
                throw ValidationException::withMessages([
                    "lines.{$idx}.chartaccount_id" => ["Account #{$accId} does not belong to this organization or does not exist."],
                ]);
            }

            /** @var ChartAccount $acc */
            $acc = $accounts->get($accId);
            if (!$acc->isLedger()) {
                throw ValidationException::withMessages([
                    "lines.{$idx}.chartaccount_id" => ["Account '{$acc->name}' ({$acc->code}) is a GROUP folder. Posting is only allowed to LEDGER accounts."],
                ]);
            }

            if (strtoupper((string) $acc->status) !== 'ACTIVE') {
                throw ValidationException::withMessages([
                    "lines.{$idx}.chartaccount_id" => ["Account '{$acc->name}' ({$acc->code}) is inactive."],
                ]);
            }
        }

        // 5. Transaction write
        return DB::transaction(function () use (
            $organizationId,
            $date,
            $description,
            $parsedLines,
            $sourceType,
            $sourceId,
            $ownerId,
            $contractId,
            $propertyId,
            $unitId,
            $createdBy,
            $status
        ) {
            $transaction = AccountingTransaction::create([
                'organization_id' => $organizationId,
                'date'            => $date,
                'description'     => $description,
                'status'          => strtoupper($status),
                'source_type'     => $sourceType,
                'source_id'       => $sourceId,
                'owner_id'        => $ownerId,
                'contract_id'     => $contractId,
                'property_id'     => $propertyId,
                'unit_id'         => $unitId,
                'created_by'      => $createdBy,
            ]);

            $now = now();
            $ledgerRows = [];
            foreach ($parsedLines as $line) {
                $ledgerRows[] = [
                    'organization_id' => $organizationId,
                    'trans_id'        => $transaction->id,
                    'chartaccount_id' => $line['chartaccount_id'],
                    'debit'           => $line['debit'],
                    'credit'          => $line['credit'],
                    'created_at'      => $now,
                ];
            }

            Ledger::insert($ledgerRows);

            return $transaction->load(['ledgers.chartAccount']);
        });
    }

    /**
     * Reverse a completed journal entry by posting an equal and opposite journal.
     * Original journal rows remain immutable.
     *
     * @param AccountingTransaction $transaction
     * @param int|null $actorUserId
     * @param string|null $reason
     * @return AccountingTransaction
     * @throws ValidationException
     */
    public function reverse(AccountingTransaction $transaction, ?int $actorUserId = null, ?string $reason = null): AccountingTransaction
    {
        if (strtoupper((string) $transaction->status) !== 'COMPLETED') {
            throw ValidationException::withMessages([
                'transaction' => ['Only COMPLETED journals can be reversed.'],
            ]);
        }

        $transaction->loadMissing('ledgers');
        if ($transaction->ledgers->isEmpty()) {
            throw ValidationException::withMessages([
                'transaction' => ['No ledger lines found to reverse.'],
            ]);
        }

        // Prepare opposite lines
        $reversalLines = [];
        foreach ($transaction->ledgers as $ledger) {
            $reversalLines[] = new JournalLine(
                chartAccountId: (int) $ledger->chartaccount_id,
                debit: (string) $ledger->credit,
                credit: (string) $ledger->debit
            );
        }

        $desc = "Reversal of Journal #{$transaction->id}" . ($reason ? ": {$reason}" : '');

        return $this->post(
            organizationId: (int) $transaction->organization_id,
            date: now()->toDateString(),
            description: $desc,
            lines: $reversalLines,
            sourceType: 'REVERSAL',
            sourceId: (int) $transaction->id,
            ownerId: $transaction->owner_id ? (int) $transaction->owner_id : null,
            contractId: $transaction->contract_id ? (int) $transaction->contract_id : null,
            propertyId: $transaction->property_id ? (int) $transaction->property_id : null,
            unitId: $transaction->unit_id ? (int) $transaction->unit_id : null,
            createdBy: $actorUserId,
            status: 'COMPLETED'
        );
    }

    private function addDecimals(string $a, string $b): string
    {
        if (function_exists('bcadd')) {
            return bcadd($a, $b, 4);
        }
        return number_format((float) $a + (float) $b, 4, '.', '');
    }

    private function compareDecimals(string $a, string $b, int $scale = 4): int
    {
        if (function_exists('bccomp')) {
            return bccomp($a, $b, $scale);
        }
        $diff = (float) $a - (float) $b;
        if (abs($diff) < 0.0001) {
            return 0;
        }
        return $diff > 0 ? 1 : -1;
    }
}
