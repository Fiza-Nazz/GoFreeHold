<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_revenue_report(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
             ->getJson('/api/admin/reports/revenue')
             ->assertOk()
             ->assertJsonStructure(['status', 'data']);
    }

    public function test_non_admin_cannot_access_reports(): void
    {
        $tenant = $this->tenantUser();

        $this->actingAs($tenant)
             ->getJson('/api/admin/reports/revenue')
             ->assertForbidden();
    }
}
