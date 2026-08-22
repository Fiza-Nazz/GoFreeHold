<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin can create a property and a unit.
     * All required fields (address, city, floor, size, price) are included.
     */
    public function test_admin_can_create_property_and_unit()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $ownerUser = User::factory()->create(['role' => 'owner']);
        $ownerProfile = \App\Domain\Auth\Models\Owner::firstOrCreate(['user_id' => $ownerUser->id], ['name' => $ownerUser->name, 'email' => $ownerUser->email]);

        $propertyData = [
            'name'        => 'Blue Tower',
            'owner_id'    => $ownerProfile->id,
            'address'     => '123 Sheikh Zayed Road',
            'city'        => 'Dubai',
            'type'        => 'residential',
            'description' => 'Test property',
        ];

        $propertyResponse = $this->actingAs($admin)->postJson('/api/admin/properties', $propertyData);
        $propertyResponse->assertStatus(201);
        $propertyId = $propertyResponse->json('data.property.id');

        $unitData = [
            'property_id' => $propertyId,
            'owner_id'    => $ownerProfile->id,
            'number'      => '201',
            'type'        => 'apartment',
            'status'      => 'AVAILABLE',
            'floor'       => 2,
            'size'        => 850,
            'price'       => 75000,
        ];

        $unitResponse = $this->actingAs($admin)->postJson('/api/admin/units', $unitData);
        $unitResponse->assertStatus(201);

        $this->assertDatabaseHas('properties', ['name' => 'Blue Tower']);
        $this->assertDatabaseHas('units', ['number' => '201', 'status' => 'AVAILABLE']);
    }

    /**
     * Test unit starts with AVAILABLE status.
     */
    public function test_unit_starts_available()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $ownerUser = User::factory()->create(['role' => 'owner']);
        $ownerProfile = \App\Domain\Auth\Models\Owner::firstOrCreate(['user_id' => $ownerUser->id], ['name' => $ownerUser->name, 'email' => $ownerUser->email]);

        $propertyResponse = $this->actingAs($admin)->postJson('/api/admin/properties', [
            'name'     => 'Marina Heights',
            'owner_id' => $ownerProfile->id,
            'address'  => '456 Marina Walk',
            'city'     => 'Dubai',
            'type'     => 'residential',
        ]);
        $propertyResponse->assertStatus(201);
        $propertyId = $propertyResponse->json('data.property.id');

        $unitResponse = $this->actingAs($admin)->postJson('/api/admin/units', [
            'property_id' => $propertyId,
            'owner_id'    => $ownerProfile->id,
            'number'      => 'A-101',
            'type'        => 'apartment',
            'status'      => 'AVAILABLE',
            'floor'       => 1,
            'size'        => 700,
            'price'       => 60000,
        ]);
        $unitResponse->assertStatus(201);

        $this->assertDatabaseHas('units', ['number' => 'A-101', 'status' => 'AVAILABLE']);
    }
}
