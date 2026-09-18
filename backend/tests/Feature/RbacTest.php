<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    public static function adminOnlyRoutes(): array
    {
        return [
            'properties list'   => ['GET',  '/api/admin/properties'],
            'units list'        => ['GET',  '/api/admin/units'],
            'contracts list'    => ['GET',  '/api/admin/contracts'],
            'payments list'     => ['GET',  '/api/admin/payments'],
            'settlements list'  => ['GET',  '/api/admin/settlements'],
            'reports revenue'   => ['GET',  '/api/admin/reports/revenue'],
        ];
    }

    #[DataProvider('adminOnlyRoutes')]
    public function test_admin_can_access_admin_route(string $method, string $uri): void
    {
        $this->actingAs($this->adminUser())->json($method, $uri)->assertOk();
    }

    #[DataProvider('adminOnlyRoutes')]
    public function test_tenant_blocked_from_admin_route(string $method, string $uri): void
    {
        $tenant = $this->tenantUser();

        $this->actingAs($tenant)
             ->json($method, $uri)
             ->assertForbidden();
    }

    #[DataProvider('adminOnlyRoutes')]
    public function test_owner_blocked_from_admin_route(string $method, string $uri): void
    {
        $owner = $this->ownerUser();

        $this->actingAs($owner)
             ->json($method, $uri)
             ->assertForbidden();
    }

    #[DataProvider('adminOnlyRoutes')]
    public function test_unauthenticated_blocked_from_admin_route(string $method, string $uri): void
    {
        $this->json($method, $uri)->assertUnauthorized();
    }

    public function test_maintenance_role_can_access_its_routes_but_not_admin_routes(): void
    {
        $maintenance = $this->maintenanceUser();

        $this->actingAs($maintenance)->getJson('/api/maintenance/complaints')->assertOk();
        $this->actingAs($maintenance)->getJson('/api/maintenance/daily-report')->assertOk();
        $this->actingAs($maintenance)->getJson('/api/admin/properties')->assertForbidden();
    }

    public function test_role_denial_precedes_resource_binding_for_existing_and_missing_records(): void
    {
        $property = \App\Domain\Property\Models\Property::factory()->create();
        $tenant = $this->tenantUser();
        foreach ([$property->id, 2147483647] as $id) {
            foreach (['GET', 'PUT', 'DELETE'] as $method) {
                $this->actingAs($tenant)->json($method, '/api/admin/properties/'.$id)
                    ->assertForbidden()->assertJsonPath('message', 'Unauthorized access. Role requirement not met.');
            }
        }
        $this->assertDatabaseHas('properties', ['id' => $property->id]);
        $this->actingAs($this->adminUser())->getJson('/api/admin/properties/2147483647')->assertNotFound();
    }
}
