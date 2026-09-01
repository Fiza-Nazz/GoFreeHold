<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Contract\Models\Contract;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyUnitEndToEndTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_property_and_unit_crud_and_lifecycle(): void
    {
        $admin = $this->adminUser();
        $owner = Owner::factory()->create(['name' => 'Emaar Properties PJSC']);

        // 1. Create Property
        $propertyPayload = [
            'name'     => 'Dubai Marina Pearl Tower',
            'code'     => 'DMP-01',
            'type'     => 'residential',
            'owner_id' => $owner->id,
            'address'  => 'Dubai Marina Walk, Dubai, UAE',
            'city'     => 'Dubai',
            'country'  => 'United Arab Emirates',
        ];

        $propResponse = $this->actingAs($admin)->postJson('/api/admin/properties', $propertyPayload);
        $propResponse->assertStatus(201);
        $propertyId = $propResponse->json('data.property.id');

        $this->assertDatabaseHas('properties', [
            'id'          => $propertyId,
            'name'        => 'Dubai Marina Pearl Tower',
            'total_units' => 0,
        ]);

        // 2. Create Unit 101
        $unitPayload1 = [
            'property_id' => $propertyId,
            'number'      => '101',
            'dhewa_no'    => 'DEWA-99881',
            'category'    => 'Luxury',
            'floor'       => 1,
            'type'        => 'apartment',
            'size'        => 1250.5,
            'furnished'   => true,
            'price'       => 95000,
            'status'      => 'AVAILABLE',
        ];

        $unitRes1 = $this->actingAs($admin)->postJson('/api/admin/units', $unitPayload1);
        $unitRes1->assertStatus(201);
        $unitId1 = $unitRes1->json('data.unit.id');

        // Check property total_units incremented
        $property = Property::find($propertyId);
        $this->assertEquals(1, $property->total_units);

        // 3. Create Unit 102
        $unitPayload2 = [
            'property_id' => $propertyId,
            'number'      => '102',
            'dhewa_no'    => 'DEWA-99882',
            'category'    => 'Standard',
            'floor'       => 1,
            'type'        => 'apartment',
            'size'        => 850,
            'furnished'   => false,
            'price'       => 65000,
            'status'      => 'AVAILABLE',
        ];

        $unitRes2 = $this->actingAs($admin)->postJson('/api/admin/units', $unitPayload2);
        $unitRes2->assertStatus(201);
        $unitId2 = $unitRes2->json('data.unit.id');

        $property->refresh();
        $this->assertEquals(2, $property->total_units);

        // 4. List Units with Filtering
        $listResponse = $this->actingAs($admin)->getJson("/api/admin/units?property_id={$propertyId}");
        $listResponse->assertStatus(200);
        $this->assertCount(2, $listResponse->json('data.units'));

        // 5. Update Unit (price adjustment & category)
        $updateResponse = $this->actingAs($admin)->putJson("/api/admin/units/{$unitId1}", [
            'price'    => 105000,
            'category' => 'Ultra Luxury',
            'floor'    => 1,
            'type'     => 'apartment',
            'number'   => '101',
        ]);
        $updateResponse->assertStatus(200);

        $this->assertDatabaseHas('units', [
            'id'       => $unitId1,
            'price'    => 105000,
            'category' => 'Ultra Luxury',
        ]);

        // 6. Contract Leasing: Unit 101 becomes OCCUPIED
        $tenant = Tenant::factory()->create(['name' => 'Sheikh Hamdan']);
        $contractResponse = $this->actingAs($admin)->postJson('/api/admin/contracts', [
            'unit_id'          => $unitId1,
            'owner_id'         => $owner->id,
            'tenant_id'        => $tenant->id,
            'start_date'       => Carbon::now()->startOfMonth()->toDateString(),
            'end_date'         => Carbon::now()->addYear()->startOfMonth()->toDateString(),
            'due_date'         => Carbon::now()->startOfMonth()->toDateString(),
            'rent_amount'      => 105000,
            'security_deposit' => 10000,
            'type'             => 'residential',
            'mode_of_payment'  => 'cheque',
        ]);
        $contractResponse->assertStatus(201);
        $contractId = $contractResponse->json('data.contract.id');

        $unit1 = Unit::find($unitId1);
        $this->assertEquals('OCCUPIED', $unit1->status);

        // Filter vacant units (only Unit 102 should be returned)
        $vacantResponse = $this->actingAs($admin)->getJson("/api/admin/units?status=AVAILABLE");
        $vacantResponse->assertStatus(200);
        $vacantUnits = $vacantResponse->json('data.units');
        $this->assertCount(1, $vacantUnits);
        $this->assertEquals('102', $vacantUnits[0]['number']);

        // 7. Vacate Contract: Unit 101 returns to AVAILABLE
        $vacateResponse = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contractId}/vacate", [
            'notes' => 'Tenant vacated smoothly.',
        ]);
        $vacateResponse->assertStatus(200);
        $unit1->refresh();
        $this->assertEquals('AVAILABLE', $unit1->status);

        // 8. Delete Unit 102 (total_units should decrement to 1)
        $deleteUnitResponse = $this->actingAs($admin)->deleteJson("/api/admin/units/{$unitId2}");
        $deleteUnitResponse->assertStatus(200);

        $this->assertDatabaseMissing('units', ['id' => $unitId2]);
        $property->refresh();
        $this->assertEquals(1, $property->total_units);

        // 9. Delete Unit 101 and then Property
        $this->actingAs($admin)->deleteJson("/api/admin/units/{$unitId1}")->assertStatus(200);
        $property->refresh();
        $this->assertEquals(0, $property->total_units);

        $deletePropResponse = $this->actingAs($admin)->deleteJson("/api/admin/properties/{$propertyId}");
        $deletePropResponse->assertStatus(200);
        $this->assertDatabaseMissing('properties', ['id' => $propertyId]);
    }
}
