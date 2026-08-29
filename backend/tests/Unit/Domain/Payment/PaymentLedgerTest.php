<?php

namespace Tests\Unit\Domain\Payment;

use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\RentTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentLedgerTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_creates_credit_in_rent_transactions(): void
    {
        $admin    = $this->adminUser();
        $contract = Contract::factory()->active()->create();

        $this->actingAs($admin)->postJson('/api/admin/payments', [
            'contract_id' => $contract->id,
            'tenant_id'   => $contract->tenant_id,
            'type'        => 'rent',
            'mode'        => 'cash',
            'amount'      => 2000,
            'date'        => now()->toDateString(),
        ])->assertStatus(201);

        $this->assertDatabaseHas('rent_transactions', [
            'contract_id' => $contract->id,
            'debit'       => 0,
            'credit'      => 2000,
        ]);
    }

    public function test_deleting_payment_reverses_ledger_credit(): void
    {
        $admin    = $this->adminUser();
        $contract = Contract::factory()->active()->create();

        $res = $this->actingAs($admin)->postJson('/api/admin/payments', [
            'contract_id' => $contract->id,
            'tenant_id'   => $contract->tenant_id,
            'type'        => 'rent',
            'mode'        => 'cash',
            'amount'      => 2000,
            'date'        => now()->toDateString(),
        ])->assertStatus(201);

        $paymentId = $res->json('data.payment.id');

        $this->actingAs($admin)->deleteJson("/api/admin/payments/{$paymentId}", [
            'reason' => 'Entered by mistake',
        ])->assertStatus(200);

        $this->assertSoftDeleted('payments', ['id' => $paymentId]);
        $this->assertSoftDeleted('rent_transactions', ['payment_id' => $paymentId]);
    }
}
