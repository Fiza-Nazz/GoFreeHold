<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Property\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaintenanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_can_create_complaint(): void
    {
        $tenantUser = $this->tenantUser();
        $tenant     = Tenant::factory()->create(['user_id' => $tenantUser->id]);
        $unit       = Unit::factory()->create();

        $complaintData = [
            'unit_id'     => $unit->id,
            'title'       => 'AC issue',
            'description' => 'AC is not working',
            'priority'    => 'high',
        ];

        $response = $this->actingAs($tenantUser)->postJson('/api/tenant/complaints', $complaintData);
        $response->assertStatus(201);

        $this->assertDatabaseHas('complaints', [
            'description' => 'AC is not working',
            'status'      => 'open',
            'tenant_id'   => $tenant->id,
        ]);
    }

    public function test_admin_can_assign_complaint(): void
    {
        $admin       = $this->adminUser();
        $maintenance = $this->maintenanceUser();
        $complaint   = Complaint::factory()->create();

        $response = $this->actingAs($admin)->postJson("/api/admin/complaints/{$complaint->id}/assign", [
            'assigned_to' => $maintenance->id,
            'status'      => 'assigned',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('complaints', [
            'id'          => $complaint->id,
            'assigned_to' => $maintenance->id,
        ]);
    }

    public function test_maintenance_user_can_update_complaint_status(): void
    {
        $maintenance = $this->maintenanceUser();
        $complaint   = Complaint::factory()->create(['status' => 'open']);

        $this->actingAs($maintenance)
             ->postJson("/api/maintenance/complaints/{$complaint->id}/status", ['status' => 'in_progress'])
             ->assertOk();

        $this->assertDatabaseHas('complaints', ['id' => $complaint->id, 'status' => 'in_progress']);
    }
}
