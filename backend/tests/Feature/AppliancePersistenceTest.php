<?php

namespace Tests\Feature;

use App\Domain\Property\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppliancePersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_appliance_details_survive_create_read_update_and_clear(): void
    {
        $unit = Unit::factory()->create();
        $this->actingAs($this->adminUser());
        $data = [
            'unit_id' => $unit->id, 'name' => 'Refrigerator', 'brand' => 'Samsung',
            'model_number' => 'RT38', 'serial_number' => 'VERIFY-PERSIST-001',
            'purchase_date' => '2026-09-10', 'warranty_expiry' => '2027-09-10',
            'condition' => 'brand_new', 'notes' => 'Kitchen appliance',
        ];
        $response = $this->postJson('/api/admin/appliances', $data)->assertCreated();
        $id = $response->json('data.appliance.id');
        $this->assertDatabaseHas('appliances', [
            'id' => $id, 'model' => 'RT38', 'warranty_expiry' => '2027-09-10',
            'condition' => 'brand_new', 'notes' => 'Kitchen appliance',
        ]);
        $this->getJson("/api/admin/appliances/{$id}")->assertOk()
            ->assertJsonPath('data.appliance.model', 'RT38')
            ->assertJsonPath('data.appliance.purchase_date', '2026-09-10')
            ->assertJsonPath('data.appliance.warranty_expiry', '2027-09-10')
            ->assertJsonPath('data.appliance.condition', 'brand_new')
            ->assertJsonPath('data.appliance.notes', 'Kitchen appliance');
        $this->putJson("/api/admin/appliances/{$id}", ['condition' => 'good', 'notes' => null, 'warranty_expiry' => null])->assertOk();
        $this->assertDatabaseHas('appliances', ['id' => $id, 'condition' => 'good', 'notes' => null, 'warranty_expiry' => null, 'model' => 'RT38']);
        $this->postJson('/api/admin/appliances', array_merge($data, ['unit_id' => 0]))->assertUnprocessable();
    }
}
