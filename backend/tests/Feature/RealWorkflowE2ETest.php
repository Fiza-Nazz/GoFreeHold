<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Services\ContractService;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use App\Models\Payment;
use App\Models\RentTransaction;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RealWorkflowE2ETest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_end_to_end_real_estate_lifecycle(): void
    {
        $admin = $this->adminUser();
        $owner = Owner::factory()->create(['name' => 'Al Futtaim Real Estate']);

        // 1. Create Property and Unit
        $property = Property::create([
            'name'     => 'Burj Crown Residences',
            'code'     => 'BCR-01',
            'type'     => 'residential',
            'owner_id' => $owner->id,
            'address'  => 'Downtown Dubai, UAE',
            'city'     => 'Dubai',
            'country'  => 'United Arab Emirates',
        ]);

        $unit = Unit::factory()->create([
            'property_id' => $property->id,
            'owner_id'    => $owner->id,
            'number'      => 'A-1402',
            'type'        => 'apartment',
            'price'       => 145000,
            'status'      => 'AVAILABLE',
        ]);

        $this->assertEquals('AVAILABLE', $unit->status);

        // 2. Admin Creates Contract with On-The-Fly Tenant Info (No prior Tenant created)
        $contractPayload = [
            'unit_id'                => $unit->id,
            'owner_id'               => $owner->id,
            'tenant_name'            => 'Dr. Mansoor Al Qasimi',
            'tenant_email'           => 'mansoor.qasimi@uae.gov.ae',
            'tenant_phone'           => '+971509988776',
            'tenant_emirates_id'     => '784-1985-1122334-1',
            'tenant_nationality'     => 'Emirati',
            'tenant_passport_number' => 'P77665544',
            'tenant_address'         => 'Villa 45, Jumeirah 1, Dubai',
            'start_date'             => '2026-09-01',
            'end_date'               => '2027-08-31',
            'due_date'               => '2026-09-01',
            'rent_amount'            => 145000,
            'security_deposit'       => 10000,
            'type'                   => 'residential',
            'mode_of_payment'        => 'cheque',
        ];

        $response = $this->actingAs($admin)->postJson('/api/admin/contracts', $contractPayload);
        $response->assertStatus(201);
        $contractId = $response->json('data.contract.id');

        // Check Step A: Auto-created User
        $user = User::where('email', 'mansoor.qasimi@uae.gov.ae')->first();
        $this->assertNotNull($user);
        $this->assertEquals('Dr. Mansoor Al Qasimi', $user->name);
        $this->assertEquals('tenant', $user->role);

        // Check Step B: Auto-created Tenant Profile
        $tenant = Tenant::where('user_id', $user->id)->first();
        $this->assertNotNull($tenant);
        $this->assertEquals('784-1985-1122334-1', $tenant->emirates_id);
        $this->assertEquals('+971509988776', $tenant->phone);
        $this->assertEquals('Emirati', $tenant->nationality);

        // Check Step C: Contract Linked to Tenant & Active
        $contract = Contract::find($contractId);
        $this->assertNotNull($contract);
        $this->assertEquals($tenant->id, $contract->tenant_id);
        $this->assertEquals('active', $contract->status);

        // Check Step D: Unit Automatically Occupied
        $this->assertEquals('OCCUPIED', $unit->fresh()->status);

        // Check Step E: Rent Ledger Initial Debit Posted
        $this->assertDatabaseHas('rent_transactions', [
            'contract_id' => $contract->id,
            'debit'       => 145000,
            'credit'      => 0,
        ]);

        // 3. Process Rent Payment of 72,500 AED (Cheque 1 of 2)
        $paymentResponse = $this->actingAs($admin)->postJson('/api/admin/payments', [
            'contract_id'   => $contract->id,
            'tenant_id'     => $contract->tenant_id,
            'amount'        => 72500,
            'date'          => '2026-09-01',
            'mode'          => 'cheque',
            'type'          => 'rent',
            'status'        => 'completed',
        ]);
        $paymentResponse->assertStatus(201);

        // Verify Payment Ledger Credit row auto-created
        $this->assertDatabaseHas('rent_transactions', [
            'contract_id' => $contract->id,
            'credit'      => 72500,
        ]);

        // Calculate Outstanding Balance
        $totalDebit  = RentTransaction::where('contract_id', $contract->id)->sum('debit');
        $totalCredit = RentTransaction::where('contract_id', $contract->id)->sum('credit');
        $balance     = $totalDebit - $totalCredit;
        $this->assertEquals(145000, $totalDebit);
        $this->assertEquals(72500, $totalCredit);
        $this->assertEquals(72500, $balance);

        // 4. Admin Renews Contract for Year 2 at 150,000 AED
        $renewResponse = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/renew", [
            'new_end_date'    => '2028-08-31',
            'new_rent_amount' => 150000,
        ]);
        $renewResponse->assertStatus(200);
        $this->assertEquals('2028-08-31', $contract->fresh()->end_date->toDateString());
        $this->assertEquals(150000, $contract->fresh()->rent_amount);

        // 5. Admin Vacates Contract (Move-Out Workflow)
        $vacateResponse = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/vacate", [
            'notes' => 'Contract tenure completed, keys handed over.',
        ]);
        $vacateResponse->assertStatus(200);

        // Verify Contract Status is 'vacated' and Unit is freed to 'AVAILABLE'
        $this->assertEquals('vacated', $contract->fresh()->status);
        $this->assertEquals('AVAILABLE', $unit->fresh()->status);
    }
}
