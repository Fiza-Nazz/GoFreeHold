<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\User;
use App\Domain\Report\Models\NotificationSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NotificationSchedulerTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_notification_settings_index_seeds_all_four_defaults(): void
    {
        $admin = $this->makeAdmin();
        $res = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/settings/notifications');

        $res->assertStatus(200)->assertJsonStructure(['status', 'data' => ['settings', 'logs']]);
        $this->assertDatabaseHas('notification_settings', ['key' => 'contract_expiry']);
        $this->assertDatabaseHas('notification_settings', ['key' => 'pending_cheques']);
        $this->assertDatabaseHas('notification_settings', ['key' => 'vacant_properties']);
        $this->assertDatabaseHas('notification_settings', ['key' => 'monthly_dues']);
    }

    public function test_alert_contract_expiry_command_respects_disabled_setting(): void
    {
        Mail::fake();
        NotificationSetting::create([
            'key'                => 'contract_expiry',
            'enabled'            => false,
            'recipient_email'    => 'admin@gofreehold.ae',
            'days_before_expiry' => 100,
        ]);

        Artisan::call('alert:contract-expiry');
        $this->assertDatabaseMissing('notifications_log', ['type' => 'contract_expiry']);
    }

    public function test_alert_pending_cheques_logs_checked_when_none_pending(): void
    {
        Mail::fake();
        NotificationSetting::create([
            'key'                => 'pending_cheques',
            'enabled'            => true,
            'recipient_email'    => 'finance@gofreehold.ae',
            'days_before_expiry' => 7,
        ]);

        Artisan::call('alert:pending-cheques');
        $this->assertDatabaseHas('notifications_log', ['type' => 'pending_cheques', 'status' => 'checked']);
    }

    public function test_alert_vacant_properties_logs_checked_when_no_vacancies(): void
    {
        Mail::fake();
        NotificationSetting::create([
            'key'             => 'vacant_properties',
            'enabled'         => true,
            'recipient_email' => 'admin@gofreehold.ae',
        ]);

        Artisan::call('alert:vacant-properties');
        $this->assertDatabaseHas('notifications_log', ['type' => 'vacant_properties', 'status' => 'checked']);
    }

    public function test_trigger_single_alert_via_api_returns_success(): void
    {
        Mail::fake();
        $admin = $this->makeAdmin();
        $res = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/settings/notifications/trigger/vacant_properties');

        $res->assertStatus(200)
            ->assertJsonStructure(['status', 'message', 'data' => ['command', 'output', 'logs']]);
        $this->assertEquals('success', $res->json('status'));
    }

    public function test_trigger_invalid_key_returns_400(): void
    {
        $admin = $this->makeAdmin();
        $res = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/settings/notifications/trigger/bogus_key');

        $res->assertStatus(400)->assertJson(['status' => 'error']);
    }

    public function test_run_full_scheduler_via_api_contains_all_commands(): void
    {
        Mail::fake();
        $admin = $this->makeAdmin();
        $res = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/settings/notifications/run-scheduler');

        $res->assertStatus(200);
        $data = $res->json('data');
        $this->assertArrayHasKey('rent:post-monthly', $data['results']);
        $this->assertArrayHasKey('alert:contract-expiry', $data['results']);
        $this->assertArrayHasKey('alert:pending-cheques', $data['results']);
        $this->assertArrayHasKey('alert:vacant-properties', $data['results']);
        $this->assertArrayHasKey('alert:monthly-dues', $data['results']);
    }

    public function test_notification_logs_endpoint_returns_structured_response(): void
    {
        $admin = $this->makeAdmin();
        $res = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/settings/notifications/logs');

        $res->assertStatus(200)->assertJsonStructure(['status', 'data' => ['logs']]);
    }
}
