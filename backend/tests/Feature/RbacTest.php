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
}
