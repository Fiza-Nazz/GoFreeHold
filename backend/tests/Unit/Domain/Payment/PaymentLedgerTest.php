<?php

namespace Tests\Unit\Domain\Payment;

use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\PaymentAuditLog;
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
        $ledgerId = RentTransaction::where('payment_id', $paymentId)->value('id');
        $reason = 'Entered by mistake';

        $this->actingAs($admin)->deleteJson("/api/admin/payments/{$paymentId}", [
            'reason' => $reason,
        ])->assertStatus(200);

        $this->assertSoftDeleted('payments', [
            'id' => $paymentId,
            'deleted_by' => $admin->id,
            'deletion_reason' => $reason,
        ]);
        $this->assertSoftDeleted('rent_transactions', [
            'id' => $ledgerId,
            'payment_id' => $paymentId,
            'deleted_by' => $admin->id,
            'deletion_reason' => $reason,
        ]);

        $this->assertDatabaseHas('payment_audit_logs', [
            'ledger_id' => $ledgerId,
            'payment_id' => $paymentId,
            'action' => 'deleted',
            'reason' => $reason . ' (linked ledger credit reversed with payment)',
            'performed_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('payment_audit_logs', [
            'ledger_id' => $ledgerId,
            'payment_id' => $paymentId,
            'action' => 'deleted',
            'reason' => $reason,
            'performed_by' => $admin->id,
        ]);

        $this->assertCount(2, PaymentAuditLog::where('payment_id', $paymentId)->get());
    }
}
