<?php

namespace App\Domain\Accounting\Services\Posters;

use App\Domain\Accounting\Models\AccountingTransaction;
use App\Domain\Accounting\Services\AccountSeeder;
use App\Domain\Accounting\Services\JournalLine;
use App\Domain\Accounting\Services\JournalService;
use App\Domain\Settlement\Models\FinancialEntry;

class FinancialEntryPoster
{
    public function __construct(
        private readonly JournalService $journalService,
        private readonly AccountSeeder $accountSeeder
    ) {
    }

    /**
     * Post a financial entry (income/expense/loan) into General Ledger.
     */
    public function postEntry(FinancialEntry $entry, ?int $organizationId = null): ?AccountingTransaction
    {
        if ($entry->ac_transaction_id) {
            return AccountingTransaction::find($entry->ac_transaction_id);
        }

        $entry->loadMissing('contract.unit');
        $contract = $entry->contract;
        $orgId = $organizationId ?: (int) ($contract?->organization_id ?? $entry->recordedBy?->organization_id ?? 0);

        if (!$orgId) {
            return null;
        }

        $amount = (float) $entry->amount;
        if ($amount <= 0) {
            return null;
        }

        $amountStr = number_format($amount, 4, '.', '');
        $type = strtolower(trim((string) $entry->type));

        $bankAccount = $this->accountSeeder->getAccountByCode($orgId, '1200'); // Bank
        $otherIncome = $this->accountSeeder->getAccountByCode($orgId, '4300'); // Other Income
        $expenseAccount = $this->accountSeeder->getAccountByCode($orgId, '6200'); // Admin / Other Expense
        $liabilityAccount = $this->accountSeeder->getAccountByCode($orgId, '2300'); // Accounts Payable / Liability

        if (!$bankAccount) {
            return null;
        }

        if ($type === 'income') {
            if (!$otherIncome) return null;
            // Dr Bank · Cr Other Income
            $lines = [
                new JournalLine((int) $bankAccount->id, $amountStr, '0'),
                new JournalLine((int) $otherIncome->id, '0', $amountStr),
            ];
        } elseif ($type === 'expense') {
            if (!$expenseAccount) return null;
            // Dr Expense · Cr Bank
            $lines = [
                new JournalLine((int) $expenseAccount->id, $amountStr, '0'),
                new JournalLine((int) $bankAccount->id, '0', $amountStr),
            ];
        } else {
            // loan or other liability
            if (!$liabilityAccount) return null;
            // Dr Bank · Cr Liability
            $lines = [
                new JournalLine((int) $bankAccount->id, $amountStr, '0'),
                new JournalLine((int) $liabilityAccount->id, '0', $amountStr),
            ];
        }

        $desc = "Financial Entry #{$entry->id}: " . ($entry->description ?: ucfirst($type));

        $transaction = $this->journalService->post(
            organizationId: $orgId,
            date: $entry->entry_date ? $entry->entry_date->toDateString() : now()->toDateString(),
            description: $desc,
            lines: $lines,
            sourceType: 'FINANCIAL_ENTRY',
            sourceId: (int) $entry->id,
            ownerId: $contract?->owner_id ? (int) $contract->owner_id : null,
            contractId: $contract?->id ? (int) $contract->id : null,
            propertyId: $contract?->unit?->property_id ? (int) $contract->unit->property_id : null,
            unitId: $entry->unit_id ? (int) $entry->unit_id : null,
            createdBy: $entry->recorded_by ? (int) $entry->recorded_by : null,
            status: 'COMPLETED'
        );

        $entry->ac_transaction_id = $transaction->id;
        $entry->saveQuietly();

        return $transaction;
    }
}
