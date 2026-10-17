<?php

namespace App\Domain\Accounting\Services\Posters;

use App\Domain\Accounting\Models\AccountingTransaction;
use App\Domain\Accounting\Services\AccountSeeder;
use App\Domain\Accounting\Services\JournalLine;
use App\Domain\Accounting\Services\JournalService;
use App\Domain\Contract\Models\ContractCheque;

class ChequePoster
{
    public function __construct(
        private readonly JournalService $journalService,
        private readonly AccountSeeder $accountSeeder
    ) {
    }

    /**
     * Post cheque status transition (cleared or bounced).
     */
    public function postChequeStatus(ContractCheque $cheque, string $newStatus): ?AccountingTransaction
    {
        $newStatus = strtolower(trim($newStatus));
        $cheque->loadMissing('contract.unit');
        $contract = $cheque->contract;
        $orgId = (int) ($contract?->organization_id ?? 0);

        if (!$orgId) {
            return null;
        }

        // On bounced: If previously cleared and has ac_transaction_id, reverse it
        if ($newStatus === 'bounced') {
            if ($cheque->ac_transaction_id) {
                $orig = AccountingTransaction::find($cheque->ac_transaction_id);
                if ($orig && $orig->isCompleted()) {
                    return $this->journalService->reverse($orig, null, "Cheque #{$cheque->cheque_number} bounced");
                }
            }
            return null;
        }

        // On cleared: Post Dr Bank (1200) · Cr Rent Receivable (1300)
        if ($newStatus === 'cleared') {
            if ($cheque->ac_transaction_id) {
                return AccountingTransaction::find($cheque->ac_transaction_id);
            }

            $amount = (float) $cheque->amount;
            if ($amount <= 0) {
                return null;
            }

            $amountStr = number_format($amount, 4, '.', '');
            $bankAccount = $this->accountSeeder->getAccountByCode($orgId, '1200'); // Bank
            $receivableAccount = $this->accountSeeder->getAccountByCode($orgId, '1300'); // Rent Receivable

            if (!$bankAccount || !$receivableAccount) {
                return null;
            }

            $lines = [
                new JournalLine((int) $bankAccount->id, $amountStr, '0'),
                new JournalLine((int) $receivableAccount->id, '0', $amountStr),
            ];

            $desc = "Cheque Cleared: #{$cheque->cheque_number} ({$cheque->bank_name})";

            $transaction = $this->journalService->post(
                organizationId: $orgId,
                date: now()->toDateString(),
                description: $desc,
                lines: $lines,
                sourceType: 'CHEQUE_CLEARED',
                sourceId: (int) $cheque->id,
                ownerId: $contract?->owner_id ? (int) $contract->owner_id : null,
                contractId: $contract?->id ? (int) $contract->id : null,
                propertyId: $contract?->unit?->property_id ? (int) $contract->unit->property_id : null,
                unitId: $contract?->unit_id ? (int) $contract->unit_id : null,
                status: 'COMPLETED'
            );

            $cheque->ac_transaction_id = $transaction->id;
            $cheque->saveQuietly();

            return $transaction;
        }

        return null;
    }
}
