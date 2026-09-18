<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class TenantCreationTest extends TestCase
{
    use DatabaseTransactions;

    public function test_admin_can_save_form_without_a_portal_account(): void
    {
        $payload = ['name' => 'Tenant Form Test', 'email' => 'tenant-form@example.test',
            'phone' => '0000000000', 'contact' => '0000000001', 'emirates_id' => '784-2000-0000000-0',
            'nationality' => 'Pakistani', 'passport_number' => 'TEST123456', 'address' => 'Test address'];
        $response = $this->actingAs($this->adminUser())->postJson('/api/admin/tenants', $payload);
        $response->assertCreated()->assertJsonPath('data.tenant.user_id', null);
        $id = $response->json('data.tenant.id');
        $this->assertDatabaseHas('tenants', [...$payload, 'id' => $id, 'user_id' => null]);
        $this->getJson('/api/admin/tenants/'.$id)->assertOk()->assertJsonPath('data.tenant.passport_number', 'TEST123456');
        $this->getJson('/api/admin/tenants')->assertOk()->assertJsonFragment(['id' => $id, 'name' => $payload['name']]);
    }

    public function test_existing_account_link_is_retained(): void
    {
        $user = $this->tenantUser();
        $this->actingAs($this->adminUser())->postJson('/api/admin/tenants', [
            'name' => 'Linked tenant', 'user_id' => $user->id,
        ])->assertCreated()->assertJsonPath('data.tenant.user_id', $user->id);
    }

    public function test_name_and_valid_optional_account_are_still_validated(): void
    {
        $this->actingAs($this->adminUser())->postJson('/api/admin/tenants', [])
            ->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson('/api/admin/tenants', ['name' => 'Invalid link', 'user_id' => 999999999])
            ->assertUnprocessable()->assertJsonValidationErrors('user_id');
    }

    public function test_tenant_cannot_create_tenant_records(): void
    {
        $this->actingAs($this->tenantUser())->postJson('/api/admin/tenants', ['name' => 'Not allowed'])
            ->assertForbidden();
    }
}
