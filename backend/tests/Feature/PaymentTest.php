<?php

namespace Tests\Feature;

use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\Payment;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_payment_credits_rent_ledger(): void
    {
        $admin    = $this->adminUser();
        $contract = Contract::factory()->active()->create();

        $paymentData = [
            'contract_id' => $contract->id,
            'tenant_id'   => $contract->tenant_id,
            'type'        => 'rent',
            'mode'        => 'bank_transfer',
            'amount'      => 1500,
            'date'        => Carbon::now()->toDateString(),
        ];

        $response = $this->actingAs($admin)->postJson('/api/admin/payments', $paymentData);
        $response->assertStatus(201);
        $paymentId = $response->json('data.payment.id');

        $this->assertDatabaseHas('payments', [
            'id'     => $paymentId,
            'amount' => 1500,
        ]);

        $this->assertDatabaseHas('rent_transactions', [
            'contract_id' => $contract->id,
            'payment_id'  => $paymentId,
            'debit'       => 0,
            'credit'      => 1500,
        ]);
    }

    public function test_payment_with_invalid_type_fails_validation(): void
    {
        $admin    = $this->adminUser();
        $contract = Contract::factory()->active()->create();

        $this->actingAs($admin)->postJson('/api/admin/payments', [
            'contract_id' => $contract->id,
            'tenant_id'   => $contract->tenant_id,
            'type'        => 'INVALID_TYPE',
            'mode'        => 'cash',
            'amount'      => 1000,
            'date'        => now()->toDateString(),
        ])->assertUnprocessable()
          ->assertJsonValidationErrors(['type']);
    }

    public function test_payment_delete_requires_reason(): void
    {
        $admin   = $this->adminUser();
        $payment = Payment::factory()->create();

        $this->actingAs($admin)
             ->deleteJson("/api/admin/payments/{$payment->id}", [])
             ->assertUnprocessable()
             ->assertJsonValidationErrors(['reason']);
    }
}
