<?php

namespace App\Domain\Accounting\Services\Posters;

use App\Domain\Accounting\Models\AccountingTransaction;
use App\Domain\Accounting\Services\AccountSeeder;
use App\Domain\Accounting\Services\JournalLine;
use App\Domain\Accounting\Services\JournalService;
use App\Domain\Settlement\Models\Settlement;
use App\Domain\Settlement\Models\SettlementPayment;

class SettlementPoster
{
    public function __construct(
        private readonly JournalService $journalService,
        private readonly AccountSeeder $accountSeeder
    ) {
    }

    /**
     * Post a settlement completion: Apply security deposit liability vs outstanding dues.
     */
    public function postSettlementCompletion(Settlement $settlement): ?AccountingTransaction
    {
        if ($settlement->ac_transaction_id) {
            return AccountingTransaction::find($settlement->ac_transaction_id);
        }

        $settlement->loadMissing('contract.unit');
        $contract = $settlement->contract;
        $orgId = (int) ($settlement->organization_id ?? $contract?->organization_id ?? 0);

        if (!$orgId) {
            return null;
        }

        $dues = (float) $settlement->dues;
        $deposit = (float) $settlement->receivable; // or deposit amount

        // If no financial amounts, skip
        if ($dues <= 0 && $deposit <= 0) {
            return null;
        }

        $depositAccount = $this->accountSeeder->getAccountByCode($orgId, '2100'); // Tenant Security Deposits
        $receivableAccount = $this->accountSeeder->getAccountByCode($orgId, '1300'); // Rent Receivable
        $otherReceivable = $this->accountSeeder->getAccountByCode($orgId, '1400'); // Other Receivable

        if (!$depositAccount || !$receivableAccount || !$otherReceivable) {
            return null;
        }

        $lines = [];
        $appliedDeposit = min($dues, $deposit);

        if ($appliedDeposit > 0) {
            $appliedStr = number_format($appliedDeposit, 4, '.', '');
            // Dr Tenant Security Deposits (clearing liability)
            $lines[] = new JournalLine((int) $depositAccount->id, $appliedStr, '0');
            // Cr Rent Receivable (clearing receivable)
            $lines[] = new JournalLine((int) $receivableAccount->id, '0', $appliedStr);
        }

        if (empty($lines)) {
            return null;
        }

        $transaction = $this->journalService->post(
            organizationId: $orgId,
            date: $settlement->vacant_date ? $settlement->vacant_date->toDateString() : now()->toDateString(),
            description: "Move-out Settlement #{$settlement->id} deposit application",
            lines: $lines,
            sourceType: 'SETTLEMENT',
            sourceId: (int) $settlement->id,
            ownerId: $settlement->owner_id ? (int) $settlement->owner_id : ($contract?->owner_id ? (int) $contract->owner_id : null),
            contractId: $contract?->id ? (int) $contract->id : null,
            propertyId: $contract?->unit?->property_id ? (int) $contract->unit->property_id : null,
            unitId: $contract?->unit_id ? (int) $contract->unit_id : null,
            status: 'COMPLETED'
        );

        $settlement->ac_transaction_id = $transaction->id;
        $settlement->saveQuietly();

        return $transaction;
    }

    /**
     * Post settlement payment: Dr Bank/Cash · Cr Other Receivable (1400).
     */
    public function postSettlementPayment(SettlementPayment $payment): ?AccountingTransaction
    {
        if ($payment->ac_transaction_id) {
            return AccountingTransaction::find($payment->ac_transaction_id);
        }

        $payment->loadMissing('settlement.contract.unit');
        $settlement = $payment->settlement;
        if (!$settlement) {
            return null;
        }

        $contract = $settlement->contract;
        $orgId = (int) ($settlement->organization_id ?? $contract?->organization_id ?? 0);
        if (!$orgId) {
            return null;
        }

        $amount = (float) $payment->amount;
        if ($amount <= 0) {
            return null;
        }

        $amountStr = number_format($amount, 4, '.', '');

        $method = strtolower(trim((string) $payment->payment_method));
        $isCash = ($method === 'cash');
        $debitCode = $isCash ? '1100' : '1200'; // Cash vs Bank

        $debitAccount = $this->accountSeeder->getAccountByCode($orgId, $debitCode);
        $creditAccount = $this->accountSeeder->getAccountByCode($orgId, '1400'); // Other Receivable

        if (!$debitAccount || !$creditAccount) {
            return null;
        }

        $lines = [
            new JournalLine((int) $debitAccount->id, $amountStr, '0'),
            new JournalLine((int) $creditAccount->id, '0', $amountStr),
        ];

        $transaction = $this->journalService->post(
            organizationId: $orgId,
            date: $payment->payment_date ? $payment->payment_date->toDateString() : now()->toDateString(),
            description: "Settlement Payment #{$payment->id} for Settlement #{$settlement->id}",
            lines: $lines,
            sourceType: 'SETTLEMENT_PAYMENT',
            sourceId: (int) $payment->id,
            ownerId: $settlement->owner_id ? (int) $settlement->owner_id : null,
            contractId: $contract?->id ? (int) $contract->id : null,
            propertyId: $contract?->unit?->property_id ? (int) $contract->unit->property_id : null,
            unitId: $contract?->unit_id ? (int) $contract->unit_id : null,
            status: 'COMPLETED'
        );

        $payment->ac_transaction_id = $transaction->id;
        $payment->saveQuietly();

        return $transaction;
    }
}
