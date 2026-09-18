<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Maintenance\Models\Job;
use App\Domain\Maintenance\Models\InventoryItem;
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
        \App\Domain\Contract\Models\Contract::factory()->create([
            'tenant_id'=>$tenant->id,'unit_id'=>$unit->id,'owner_id'=>$unit->owner_id,'status'=>'active',
        ]);

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

        $complaint->unit->update(['owner_id' => $complaint->unit->property->owner_id]);
        $maintenance->staffMembership->update(['owner_id' => $complaint->unit->property->owner_id]);

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
        $complaint   = Complaint::factory()->create(['status' => 'assigned', 'assigned_to' => $maintenance->id]);
        $complaint->unit->update(['owner_id' => $complaint->unit->property->owner_id]);
        $maintenance->staffMembership->update(['owner_id' => $complaint->unit->property->owner_id]);
        Job::factory()->create(['complaint_id' => $complaint->id, 'assigned_to' => $maintenance->id, 'assigned_by' => $maintenance->staffMembership->owner->user_id, 'status' => 'assigned']);

        $this->actingAs($maintenance)
             ->postJson("/api/maintenance/complaints/{$complaint->id}/status", ['status' => 'in_progress'])
             ->assertOk();

        $this->assertDatabaseHas('complaints', ['id' => $complaint->id, 'status' => 'in_progress']);
    }

    public function test_admin_completing_job_syncs_complaint_and_completion_time(): void
    {
        $admin = $this->adminUser();
        $maintenance = $this->maintenanceUser();
        $complaint = Complaint::factory()->create([
            'status' => 'assigned',
            'assigned_to' => $maintenance->id,
        ]);
        $job = Job::factory()->create([
            'complaint_id' => $complaint->id,
            'assigned_to' => $maintenance->id,
            'assigned_by' => $admin->id,
            'status' => 'assigned',
            'completed_at' => null,
        ]);

        $this->actingAs($admin)
            ->putJson("/api/admin/jobs/{$job->id}", ['status' => 'completed'])
            ->assertOk()
            ->assertJsonPath('data.job.status', 'completed')
            ->assertJsonPath('data.job.complaint.status', 'resolved');

        $this->assertDatabaseHas('complaints', [
            'id' => $complaint->id,
            'status' => 'resolved',
            'assigned_to' => $maintenance->id,
        ]);
        $this->assertNotNull($job->fresh()->completed_at);
    }

    public function test_daily_report_returns_exact_status_and_completed_job_counts(): void
    {
        $admin = $this->adminUser();
        $maintenance = $this->maintenanceUser();
        Complaint::factory()->create(['status' => 'open']);
        Complaint::factory()->create(['status' => 'assigned']);
        Complaint::factory()->create(['status' => 'in_progress']);
        $todayComplaint = Complaint::factory()->create(['status' => 'resolved']);
        $oldComplaint = Complaint::factory()->create(['status' => 'resolved']);
        $assignment = ['assigned_to' => $maintenance->id, 'assigned_by' => $admin->id];
        Job::factory()->create($assignment + ['complaint_id' => $todayComplaint->id, 'status' => 'completed', 'completed_at' => now()]);
        Job::factory()->create($assignment + ['complaint_id' => $oldComplaint->id, 'status' => 'completed', 'completed_at' => now()->subDay()]);

        $this->actingAs($admin)
            ->getJson('/api/admin/maintenance/daily-report?date=' . now()->toDateString())
            ->assertOk()
            ->assertJsonPath('data.stats.open', 1)
            ->assertJsonPath('data.stats.assigned', 1)
            ->assertJsonPath('data.stats.in_progress', 1)
            ->assertJsonPath('data.stats.resolved_today', 1)
            ->assertJsonCount(1, 'data.completed_jobs')
            ->assertJsonPath('data.completed_jobs.0.complaint_id', $todayComplaint->id);
    }

    public function test_inventory_creation_syncs_legacy_and_current_columns(): void
    {
        $unit = Unit::factory()->create();

        $response = $this->actingAs($this->adminUser())->postJson('/api/admin/inventory', [
            'name' => 'Replacement compressor', 'category' => 'HVAC', 'quantity' => 2,
            'unit_price' => 475.50, 'location_type' => 'unit', 'unit_id' => $unit->id,
            'min_stock_alert' => 1, 'notes' => 'Model CX-9',
        ]);

        $response->assertCreated()->assertJsonPath('data.item.location_id', $unit->id);
        $this->assertDatabaseHas('inventory_items', [
            'name' => 'Replacement compressor', 'unit_id' => $unit->id,
            'location_id' => $unit->id, 'unit_cost' => 475.50, 'quantity' => 2,
        ]);
    }

    public function test_purchase_creates_lines_and_calculates_total(): void
    {
        $response = $this->actingAs($this->adminUser())->postJson('/api/admin/purchases', [
            'supplier_name' => 'Verified Parts LLC', 'purchase_date' => '2026-09-09',
            'items' => [
                ['item_name' => 'Filter', 'qty' => 3, 'price' => 20.25],
                ['item_name' => 'Valve', 'qty' => 2, 'price' => 44.50],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.purchase.total_amount', 149.75)
            ->assertJsonCount(2, 'data.purchase.items');
        $purchaseId = $response->json('data.purchase.id');
        $this->assertDatabaseHas('purchases', ['id' => $purchaseId, 'total_amount' => 149.75, 'status' => 'pending']);
        $this->assertDatabaseHas('purchase_items', ['purchase_id' => $purchaseId, 'item_name' => 'Filter', 'qty' => 3]);
        $this->assertDatabaseHas('purchase_items', ['purchase_id' => $purchaseId, 'item_name' => 'Valve', 'qty' => 2]);
    }
}
