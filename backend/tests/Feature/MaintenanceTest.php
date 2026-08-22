<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\User;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaintenanceTest extends TestCase
{
    use RefreshDatabase;

    private function makeProperty(int $ownerId): Property
    {
        return Property::create([
            'name'     => 'Palm Residence',
            'owner_id' => $ownerId,
            'address'  => '50 Palm Jumeirah',
            'city'     => 'Dubai',
            'type'     => 'residential',
        ]);
    }

    public function test_tenant_can_create_complaint()
    {
        $tenantUser = User::factory()->create(['role' => 'tenant']);
        $tenant = \App\Domain\Auth\Models\Tenant::create([
            'user_id' => $tenantUser->id,
            'name' => $tenantUser->name,
            'email' => $tenantUser->email,
        ]);
        
        $ownerUser = User::factory()->create(['role' => 'owner']);
        $owner = \App\Domain\Auth\Models\Owner::firstOrCreate(['user_id' => $ownerUser->id], ['name' => $ownerUser->name, 'email' => $ownerUser->email]);

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

        $complaintData = [
            'unit_id'     => $unit->id,
            'title'       => 'AC issue',
            'description' => 'AC is not working',
            'priority'    => 'high',
            'severity'    => 'high',
        ];

        // Must act as the User model, not Tenant profile
        $response = $this->actingAs($tenantUser)->postJson('/api/tenant/complaints', $complaintData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('complaints', [
            'description' => 'AC is not working',
            'status'      => 'open',
            'tenant_id'   => $tenant->id, // API assigns it based on tenant profile
        ]);
    }

    public function test_admin_can_assign_complaint()
    {
        $admin       = User::factory()->create(['role' => 'admin']);
        $maintenance = User::factory()->create(['role' => 'maintenance']);
        $tenantUser = User::factory()->create(['role' => 'tenant']);
        
        $tenant = \App\Domain\Auth\Models\Tenant::create([
            'user_id' => $tenantUser->id,
            'name' => $tenantUser->name,
            'email' => $tenantUser->email,
        ]);
        
        $ownerUser = User::factory()->create(['role' => 'owner']);
        $owner = \App\Domain\Auth\Models\Owner::firstOrCreate(['user_id' => $ownerUser->id], ['name' => $ownerUser->name, 'email' => $ownerUser->email]);

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

        // Note: the migration uses status Enum, 'pending' might be lowercase or uppercase. We will use 'pending' as defined by your system.
        $complaint = \App\Domain\Maintenance\Models\Complaint::create([
            'unit_id'     => $unit->id,
            'tenant_id'   => $tenant->id,
            'title'       => 'Water leak',
            'description' => 'Water leak',
            'priority'    => 'high',
            'severity'    => 'high',
            'status'      => 'open',
        ]);

        $response = $this->actingAs($admin)->postJson("/api/admin/complaints/{$complaint->id}/assign", [
            'assigned_to' => $maintenance->id,
            'status'      => 'assigned', // It updates status to assigned
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('complaints', [
            'id'     => $complaint->id,
            'status' => 'assigned',
        ]);
    }
}
