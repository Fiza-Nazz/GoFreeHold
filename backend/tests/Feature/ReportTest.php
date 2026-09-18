<?php

namespace Tests\Feature;

use App\Domain\Payment\Models\Payment;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_revenue_report(): void
    {
        $admin = $this->adminUser();

        Payment::factory()->create(['amount' => 1250.50, 'type' => 'rent', 'date' => '2026-03-05']);
        Payment::factory()->create(['amount' => 249.50, 'type' => 'deposit', 'date' => '2026-03-09']);
        Payment::factory()->create(['amount' => 9999, 'type' => 'rent', 'date' => '2025-03-05']);

        $this->actingAs($admin)
             ->getJson('/api/admin/reports/revenue?year=2026')
             ->assertOk()
             ->assertJsonPath('data.year', 2026)
             ->assertJsonPath('data.total_revenue', '1500.00')
             ->assertJsonCount(2, 'data.breakdown');

        $breakdown = collect($this->actingAs($admin)->getJson('/api/admin/reports/revenue?year=2026')->json('data.breakdown'));
        $this->assertSame('1250.50', $breakdown->firstWhere('type', 'rent')['total']);
        $this->assertSame('249.50', $breakdown->firstWhere('type', 'deposit')['total']);
    }

    public function test_revenue_export_is_a_real_xlsx_zip_file(): void
    {
        $admin = $this->adminUser();
        Payment::factory()->create(['amount' => 812.25, 'date' => Carbon::now()->toDateString()]);

        $response = $this->actingAs($admin)->get('/api/admin/reports/export/revenue');

        $response->assertOk();
        $content = $response->getFile()->getContent();
        $this->assertSame("PK\x03\x04", substr($content, 0, 4));
        $this->assertStringContainsString('[Content_Types].xml', $content);
        $this->assertGreaterThan(1000, strlen($content));
    }

    public function test_non_admin_cannot_access_reports(): void
    {
        $tenant = $this->tenantUser();

        $this->actingAs($tenant)
             ->getJson('/api/admin/reports/revenue')
             ->assertForbidden();
    }
}
