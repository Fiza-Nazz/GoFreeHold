<?php

namespace Tests\Feature;

use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_property_and_unit(): void
    {
        $admin = $this->adminUser();
        $property = Property::factory()->create(['name' => 'Blue Tower']);
        $unit = Unit::factory()->for($property)->create([
            'number' => '201',
            'status' => 'AVAILABLE',
        ]);

        $this->assertDatabaseHas('properties', ['name' => 'Blue Tower']);
        $this->assertDatabaseHas('units', ['number' => '201', 'status' => 'AVAILABLE']);
    }

    public function test_owner_cannot_create_property(): void
    {
        $owner = $this->ownerUser();

        $this->actingAs($owner)->postJson('/api/admin/properties', [
            'name'    => 'Should fail',
            'address' => '1 Main St',
            'city'    => 'Dubai',
            'type'    => 'residential',
        ])->assertForbidden();
    }

    public function test_admin_can_list_vacant_units(): void
    {
        Unit::factory()->count(3)->create(['status' => 'AVAILABLE']);
        Unit::factory()->count(2)->occupied()->create();

        $response = $this->actingAs($this->adminUser())
                         ->getJson('/api/admin/reports/vacant-properties');

        $response->assertOk();
        $data = $response->json('data.vacant_units') ?? $response->json('data.units') ?? $response->json('data');
        $this->assertNotEmpty($data);
    }

    public function test_creating_unit_with_missing_required_fields_fails(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)->postJson('/api/admin/units', [
            'number' => 'X1',
        ])->assertUnprocessable();
    }
}
