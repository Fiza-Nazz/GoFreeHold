<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\User;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use App\Domain\Contract\Models\Contract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class ContractTest extends TestCase
{
    use RefreshDatabase;

    private function makeProperty(int $ownerId): Property
    {
        return Property::create([
            'name'     => 'Sunset Villa',
            'owner_id' => $ownerId,
            'address'  => '789 Jumeirah Beach Rd',
            'city'     => 'Dubai',
            'type'     => 'residential',
        ]);
    }

    public function test_creating_contract_debits_rent_and_occupies_unit()
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $ownerUser  = User::factory()->create(['role' => 'owner']);
        $owner = \App\Domain\Auth\Models\Owner::firstOrCreate(['user_id' => $ownerUser->id], ['name' => $ownerUser->name, 'email' => $ownerUser->email]);
        $tenantUser = User::factory()->create(['role' => 'tenant']);
        
        $tenantProfile = \App\Domain\Auth\Models\Tenant::create([
            'user_id' => $tenantUser->id,
            'name' => $tenantUser->name,
            'email' => $tenantUser->email,
            'phone' => '+971509876543',
        ]);

        $property = $this->makeProperty($owner->id);

        $unit = Unit::create([
            'property_id' => $property->id,
            'owner_id'    => $owner->id,
            'number'      => '101',
            'dhewa_no'    => 'DEWA-987654321',
            'type'        => 'apartment',
            'status'      => 'AVAILABLE',
            'floor'       => 1,
            'size'        => 800,
            'price'       => 50000,
        ]);

        $contractData = [
            'unit_id'          => $unit->id,
            'owner_id'         => $owner->id,
            'tenant_id'        => $tenantProfile->id,
            'start_date'       => Carbon::now()->startOfMonth()->toDateString(),
            'end_date'         => Carbon::now()->addYear()->startOfMonth()->toDateString(),
            'due_date'         => Carbon::now()->startOfMonth()->toDateString(),
            'rent_amount'      => 1500,
            'security_deposit' => 5000,
            'type'             => 'residential',
            'mode_of_payment'  => 'cash',
        ];

        $response = $this->actingAs($admin)->postJson('/api/admin/contracts', $contractData);

        $response->assertStatus(201);
        $contractId = $response->json('data.contract.id');

        $this->assertDatabaseHas('units', [
            'id'     => $unit->id,
            'status' => 'OCCUPIED',
        ]);

        $this->assertDatabaseHas('rent_transactions', [
            'contract_id' => $contractId,
            'debit'       => 1500,
            'credit'      => 0,
        ]);
    }

    public function test_vacating_contract_frees_unit()
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $ownerUser  = User::factory()->create(['role' => 'owner']);
        $owner = \App\Domain\Auth\Models\Owner::firstOrCreate(['user_id' => $ownerUser->id], ['name' => $ownerUser->name, 'email' => $ownerUser->email]);
        $tenantUser = User::factory()->create(['role' => 'tenant']);
        $tenantProfile = \App\Domain\Auth\Models\Tenant::create([
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
            'tenant_id'   => $tenantProfile->id,
            'start_date'  => Carbon::now()->subYear()->toDateString(),
            'end_date'    => Carbon::now()->toDateString(),
            'rent_amount' => 1500,
            'security_deposit' => 500,
            'status'      => 'active',
        ]);

        $response = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/vacate", [
            'notes' => 'Tenant left',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('units', [
            'id'     => $unit->id,
            'status' => 'AVAILABLE',
        ]);

        $this->assertDatabaseHas('contracts', [
            'id'     => $contract->id,
            'status' => 'vacated',
        ]);
    }

    public function test_renewing_contract_updates_end_date()
    {
        $admin  = User::factory()->create(['role' => 'admin']);
        $ownerUser  = User::factory()->create(['role' => 'owner']);
        $owner = \App\Domain\Auth\Models\Owner::firstOrCreate(['user_id' => $ownerUser->id], ['name' => $ownerUser->name, 'email' => $ownerUser->email]);
        $tenantUser = User::factory()->create(['role' => 'tenant']);
        
        $tenantProfile = \App\Domain\Auth\Models\Tenant::create([
            'user_id' => $tenantUser->id,
            'name' => $tenantUser->name,
            'email' => $tenantUser->email,
        ]);

        $property = $this->makeProperty($owner->id);

        $unit = Unit::create([
            'property_id' => $property->id,
            'owner_id'    => $owner->id,
            'number'      => '202',
            'type'        => 'apartment',
            'status'      => 'OCCUPIED',
            'floor'       => 2,
            'size'        => 900,
            'price'       => 60000,
        ]);

        $contract = Contract::create([
            'unit_id'     => $unit->id,
            'owner_id'    => $owner->id,
            'tenant_id'   => $tenantProfile->id,
            'start_date'  => Carbon::now()->subYear()->toDateString(),
            'end_date'    => Carbon::now()->toDateString(),
            'rent_amount' => 2000,
            'security_deposit' => 1000,
            'status'      => 'active',
        ]);

        $newEndDate = Carbon::now()->addYear()->toDateString();

        $response = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/renew", [
            'new_end_date'    => $newEndDate,
            'new_rent_amount' => 2200,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('contracts', [
            'id'          => $contract->id,
            'status'      => 'active',
            'rent_amount' => 2200,
        ]);
    }
}
