<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\User;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use App\Domain\Contract\Models\Contract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper: create a property with all required fields.
     */
    private function makeProperty(int $ownerId): Property
    {
        return Property::create([
            'name'     => 'Marina Towers',
            'owner_id' => $ownerId,
            'address'  => '100 Marina Blvd',
            'city'     => 'Dubai',
            'type'     => 'residential',
        ]);
    }

    /**
     * Test: Recording a payment auto-creates a credit entry in rent_transactions.
     *
     * Trigger: POST /api/admin/payments
     * Side effects:
     *   - payments row inserted
     *   - rent_transactions credit row inserted (credit = amount, debit = 0)
     *     linked to the payment via payment_id
     */
    public function test_creating_payment_credits_rent_ledger()
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $ownerUser  = User::factory()->create(['role' => 'owner']);
        $owner = \App\Domain\Auth\Models\Owner::firstOrCreate(['user_id' => $ownerUser->id], ['name' => $ownerUser->name, 'email' => $ownerUser->email]);
        $tenantUser = User::factory()->create(['role' => 'tenant']);
        $tenant = \App\Domain\Auth\Models\Tenant::create([
            'user_id' => $tenantUser->id,
            'name' => $tenantUser->name,
            'email' => $tenantUser->email,
        ]);

        $property = $this->makeProperty($owner->id);

        $unit = Unit::create([
            'property_id' => $property->id,
            'owner_id'    => $owner->id,
            'number'      => '101',
            'type'        => 'apartment',
            'status'      => 'OCCUPIED',
            'floor'       => 1,
            'size'        => 800,
            'price'       => 50000,
        ]);

        $contract = Contract::create([
            'unit_id'     => $unit->id,
            'owner_id'    => $owner->id,
            'tenant_id'   => $tenant->id,
            'start_date'  => Carbon::now()->startOfMonth()->toDateString(),
            'end_date'    => Carbon::now()->addYear()->startOfMonth()->toDateString(),
            'due_date'    => Carbon::now()->startOfMonth()->toDateString(),
            'rent_amount' => 1500,
            'security_deposit' => 500,
            'status'      => 'active',
        ]);

        $paymentData = [
            'contract_id' => $contract->id,
            'tenant_id'   => $tenant->id,
            'type'        => 'rent',
            'mode'        => 'bank_transfer',
            'amount'      => 1500,
            'date'        => Carbon::now()->toDateString(),
        ];

        $response = $this->actingAs($admin)->postJson('/api/admin/payments', $paymentData);

        $response->assertStatus(201);
        $paymentId = $response->json('data.payment.id');

        // Assert payment was created
        $this->assertDatabaseHas('payments', [
            'id'     => $paymentId,
            'amount' => 1500,
        ]);

        // Assert credit entry in ledger linked to payment
        $this->assertDatabaseHas('rent_transactions', [
            'contract_id' => $contract->id,
            'payment_id'  => $paymentId,
            'debit'       => 0,
            'credit'      => 1500,
        ]);
    }
}
