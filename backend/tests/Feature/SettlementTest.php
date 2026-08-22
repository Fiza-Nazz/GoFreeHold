<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\User;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use App\Domain\Contract\Models\Contract;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class SettlementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper: create a property with all required fields.
     */
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

    /**
     * Test: Completing a settlement with status=completed
     * auto-vacates the contract and frees the unit.
     *
     * Trigger: POST /api/admin/settlements
     * Side effects:
     *   - settlements row created with status=completed
     *   - contracts.status → vacated
     *   - units.status → AVAILABLE
     */
    public function test_completing_settlement_vacates_contract_and_frees_unit()
    {
        $admin     = User::factory()->create(['role' => 'admin']);
        $ownerUser = User::factory()->create(['role' => 'owner']);
        
        $ownerProfile = \App\Domain\Auth\Models\Owner::create([
            'user_id' => $ownerUser->id,
            'name' => $ownerUser->name,
            'email' => $ownerUser->email,
        ]);
        $tenantUser = User::factory()->create(['role' => 'tenant']);
        $tenant = \App\Domain\Auth\Models\Tenant::create([
            'user_id' => $tenantUser->id,
            'name' => $tenantUser->name,
            'email' => $tenantUser->email,
        ]);

        $property = $this->makeProperty($ownerProfile->id);

        $unit = Unit::create([
            'property_id' => $property->id,
            'owner_id'    => $ownerProfile->id,
            'number'      => '101',
            'type'        => 'apartment',
            'status'      => 'OCCUPIED',
            'floor'       => 1,
            'size'        => 800,
            'price'       => 50000,
        ]);

        $contract = Contract::create([
            'unit_id'     => $unit->id,
            'owner_id'    => $ownerProfile->id,
            'tenant_id'   => $tenant->id,
            'start_date'  => Carbon::now()->startOfMonth()->toDateString(),
            'end_date'    => Carbon::now()->addYear()->startOfMonth()->toDateString(),
            'due_date'    => Carbon::now()->startOfMonth()->toDateString(),
            'rent_amount' => 1500,
            'security_deposit' => 500,
            'status'      => 'active',
        ]);

        $settlementData = [
            'contract_id'  => $contract->id,
            'owner_id'     => $ownerProfile->id,
            'vacant_date'  => Carbon::now()->toDateString(),
            'dues'         => 500,
            'receivable'   => 100,
            'status'       => 'completed',
        ];

        $response = $this->actingAs($admin)->postJson('/api/admin/settlements', $settlementData);

        $response->assertStatus(201);
        $settlementId = $response->json('data.settlement.id');

        // Assert settlement created
        $this->assertDatabaseHas('settlements', [
            'id'     => $settlementId,
            'status' => 'completed',
        ]);

        // Assert unit freed
        $this->assertDatabaseHas('units', [
            'id'     => $unit->id,
            'status' => 'AVAILABLE',
        ]);

        // Assert contract vacated
        $this->assertDatabaseHas('contracts', [
            'id'     => $contract->id,
            'status' => 'vacated',
        ]);
    }
}
