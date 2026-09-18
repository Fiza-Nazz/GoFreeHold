<?php

namespace App\Domain\Payment\Services;

use App\Domain\Auth\Models\User;
use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\Payment;
use Illuminate\Support\Facades\DB;

class StaffPaymentService
{
    public function __construct(private OwnerContextResolver $context, private PaymentService $payments) {}

    /** @return array{Payment, bool} */
    public function record(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data) {
            $actor = User::lockForUpdate()->findOrFail($user->id);
            $this->context->assertActive($actor);
            abort_unless(in_array($actor->role, ['cashier', 'accountant'], true), 403);
            $contract = $this->context->contracts(Contract::query(), $this->context->ownerId($actor))
                ->lockForUpdate()->findOrFail($data['contract_id']);
            $key = $data['idempotency_key'];
            unset($data['idempotency_key']);
            $data['amount'] = number_format((float) $data['amount'], 2, '.', '');
            ksort($data);
            $hash = hash('sha256', json_encode($data));
            $previous = DB::table('staff_payment_requests')->where('actor_id', $actor->id)->where('request_key', $key)->first();
            if ($previous) {
                abort_unless(hash_equals($previous->payload_hash, $hash), 409, 'This payment request key was already used for different values.');
                $payment = Payment::find($previous->payment_id);
                abort_unless($payment, 409, 'This payment has been reversed. Start a new transaction.');
                return [$payment, true];
            }
            $data['tenant_id'] = $contract->tenant_id;
            $data['recorded_by'] = $actor->id;
            $payment = $this->payments->recordPayment($data);
            DB::table('staff_payment_requests')->insert([
                'actor_id' => $actor->id, 'request_key' => $key, 'payload_hash' => $hash,
                'payment_id' => $payment->id, 'created_at' => now(), 'updated_at' => now(),
            ]);
            $this->context->audit($actor, 'payment.created', $payment->id, ['contract_id' => $contract->id, 'amount' => $data['amount']]);
            return [$payment, false];
        }, 3);
    }
}
