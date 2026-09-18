<?php

namespace App\Domain\Payment\Services;

use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\PaymentAuditLog;
use App\Domain\Payment\Models\RentTransaction;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function recordPayment(array $payload): Payment
    {
        return DB::transaction(function () use ($payload) {
            $payment = Payment::create($payload);

            $typeLabel = strtoupper(str_replace('_', ' ', $payment->type));
            $description = $typeLabel . ' payment'
                . (! empty($payment->reference_number) ? ' ref ' . $payment->reference_number : '');

            RentTransaction::create([
                'contract_id' => $payment->contract_id,
                'payment_id' => $payment->id,
                'date' => $payment->date,
                'description' => $description,
                'debit' => 0,
                'credit' => $payment->amount,
            ]);

            return $payment;
        });
    }

    public function deletePayment(Payment $payment, string $reason, int $userId): void
    {
        DB::transaction(function () use ($payment, $reason, $userId) {
            $linked = RentTransaction::where('payment_id', $payment->id)
                ->where('credit', '>', 0)
                ->get();

            foreach ($linked as $ledger) {
                PaymentAuditLog::create([
                    'ledger_id' => $ledger->id,
                    'payment_id' => $payment->id,
                    'action' => 'deleted',
                    'reason' => $reason . ' (linked ledger credit reversed with payment)',
                    'performed_by' => $userId,
                    'snapshot' => $ledger->toArray(),
                ]);

                $ledger->deleted_by = $userId;
                $ledger->deletion_reason = $reason;
                $ledger->save();
                $ledger->delete();
            }

            PaymentAuditLog::create([
                'ledger_id' => $linked->first()?->id,
                'payment_id' => $payment->id,
                'action' => 'deleted',
                'reason' => $reason,
                'performed_by' => $userId,
                'snapshot' => array_merge($payment->toArray(), [
                    'entity' => 'payment',
                    'linked_ledger_ids' => $linked->pluck('id')->values()->all(),
                ]),
            ]);

            $payment->deleted_by = $userId;
            $payment->deletion_reason = $reason;
            $payment->save();
            $payment->delete();
        });
    }
}
