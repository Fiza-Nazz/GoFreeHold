<?php

namespace App\Domain\Accounting\Services\Posters;

use App\Domain\Accounting\Models\AccountingTransaction;
use App\Domain\Accounting\Services\AccountSeeder;
use App\Domain\Accounting\Services\JournalLine;
use App\Domain\Accounting\Services\JournalService;
use App\Domain\Payment\Models\Payment;

class PaymentPoster
{
    public function __construct(
        private readonly JournalService $journalService,
        private readonly AccountSeeder $accountSeeder
    ) {
    }

    /**
     * Post a payment into the General Ledger.
     * Maps payment mode to Cash (1100) vs Bank (1200), and type to matching credit accounts.
     * Prevents double-posting via ac_transaction_id check.
     */
    public function postPayment(Payment $payment): ?AccountingTransaction
    {
        if ($payment->ac_transaction_id) {
            return AccountingTransaction::find($payment->ac_transaction_id);
        }

        $payment->loadMissing('contract.unit');
        $contract = $payment->contract;
        $orgId = (int) ($contract?->organization_id ?? 0);

        if (!$orgId) {
            return null;
        }

        $amount = (float) $payment->amount;
        if ($amount <= 0) {
            return null;
        }

        $amountStr = number_format($amount, 4, '.', '');

        // 1. Determine Debit Account (Cash vs Bank by mode)
        $mode = strtolower(trim((string) $payment->mode));
        $isCash = ($mode === 'cash');
        $debitAccountCode = $isCash ? '1100' : '1200'; // 1100 = Cash, 1200 = Bank
        $debitAccount = $this->accountSeeder->getAccountByCode($orgId, $debitAccountCode);

        // 2. Determine Credit Account by payment type
        $type = strtolower(trim((string) $payment->type));
        $sourceType = 'PAYMENT_' . strtoupper($type);

        switch ($type) {
            case 'deposit':
                $creditAccountCode = '2100'; // Tenant Security Deposits (Liability)
                break;
            case 'dewa':
                $creditAccountCode = '2200'; // DEWA / Utility Liability
                break;
            case 'service_charge':
                $creditAccountCode = '1400'; // Other Receivable
                break;
            case 'other':
                $creditAccountCode = '4300'; // Other Income
                break;
            case 'rent':
            default:
                $creditAccountCode = '1300'; // Rent Receivable
                $sourceType = 'PAYMENT_RENT';
                break;
        }

        $creditAccount = $this->accountSeeder->getAccountByCode($orgId, $creditAccountCode);

        if (!$debitAccount || !$creditAccount) {
            return null;
        }

        $lines = [
            new JournalLine((int) $debitAccount->id, $amountStr, '0'),
            new JournalLine((int) $creditAccount->id, '0', $amountStr),
        ];

        $desc = "Payment #{$payment->id} ({$payment->type} via {$payment->mode})";
        if ($payment->receipt_number) {
            $desc .= " - Receipt: {$payment->receipt_number}";
        }

        $transaction = $this->journalService->post(
            organizationId: $orgId,
            date: $payment->date ? $payment->date->toDateString() : now()->toDateString(),
            description: $desc,
            lines: $lines,
            sourceType: $sourceType,
            sourceId: (int) $payment->id,
            ownerId: $contract?->owner_id ? (int) $contract->owner_id : null,
            contractId: $contract?->id ? (int) $contract->id : null,
            propertyId: $contract?->unit?->property_id ? (int) $contract->unit->property_id : null,
            unitId: $contract?->unit_id ? (int) $contract->unit_id : null,
            createdBy: $payment->recorded_by ? (int) $payment->recorded_by : null,
            status: 'COMPLETED'
        );

        $payment->ac_transaction_id = $transaction->id;
        $payment->saveQuietly();

        return $transaction;
    }
}
