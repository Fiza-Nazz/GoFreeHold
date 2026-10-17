<?php

namespace App\Domain\Accounting\Services\Posters;

use App\Domain\Accounting\Models\AccountingTransaction;
use App\Domain\Accounting\Services\AccountSeeder;
use App\Domain\Accounting\Services\JournalLine;
use App\Domain\Accounting\Services\JournalService;
use App\Domain\Payment\Models\RentTransaction;

class RentChargePoster
{
    public function __construct(
        private readonly JournalService $journalService,
        private readonly AccountSeeder $accountSeeder
    ) {
    }

    /**
     * Post a rent charge (debit line on contract rent ledger) into the General Ledger.
     * Journal: Dr Rent Receivable (1300) · Cr Rental Income (4100).
     */
    public function postCharge(RentTransaction $charge): ?AccountingTransaction
    {
        if ($charge->ac_transaction_id) {
            return AccountingTransaction::find($charge->ac_transaction_id);
        }

        $debit = (float) $charge->debit;
        if ($debit <= 0) {
            // Only charges recognize revenue; payment credits do not double-post
            return null;
        }

        $charge->loadMissing('contract.unit');
        $contract = $charge->contract;
        $orgId = (int) ($contract?->organization_id ?? 0);

        if (!$orgId) {
            return null;
        }

        $amountStr = number_format($debit, 4, '.', '');

        // 1300: Rent Receivable (Asset), 4100: Rental Income (Revenue)
        $receivableAccount = $this->accountSeeder->getAccountByCode($orgId, '1300');
        $incomeAccount = $this->accountSeeder->getAccountByCode($orgId, '4100');

        if (!$receivableAccount || !$incomeAccount) {
            return null;
        }

        $lines = [
            new JournalLine((int) $receivableAccount->id, $amountStr, '0'),
            new JournalLine((int) $incomeAccount->id, '0', $amountStr),
        ];

        $desc = "Rent Charge #{$charge->id}: " . ($charge->description ?: 'Scheduled rent charge');

        $transaction = $this->journalService->post(
            organizationId: $orgId,
            date: $charge->date ? $charge->date->toDateString() : now()->toDateString(),
            description: $desc,
            lines: $lines,
            sourceType: 'RENT_CHARGE',
            sourceId: (int) $charge->id,
            ownerId: $contract?->owner_id ? (int) $contract->owner_id : null,
            contractId: $contract?->id ? (int) $contract->id : null,
            propertyId: $contract?->unit?->property_id ? (int) $contract->unit->property_id : null,
            unitId: $contract?->unit_id ? (int) $contract->unit_id : null,
            status: 'COMPLETED'
        );

        $charge->ac_transaction_id = $transaction->id;
        $charge->saveQuietly();

        return $transaction;
    }
}
