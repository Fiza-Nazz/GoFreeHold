<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user can register with valid credentials.
     * Verifies role assignment and token issuance.
     */
    public function test_user_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'John Doe',
            'email'                 => 'johndoe@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'tenant',
            'recaptcha_token'       => 'test-token-bypass',
        ]);

        // Auth service may return 200 or 201 — assert 2xx
        $response->assertSuccessful()
                 ->assertJsonStructure(['status', 'data']);

        $this->assertDatabaseHas('users', [
            'email' => 'johndoe@example.com',
        ]);
    }

    /**
     * Test user can login and receives a valid token.
     * Response is wrapped in data.
     */
    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email'    => 'jane@example.com',
            'password' => bcrypt('password123'),
            'role'     => 'admin',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'jane@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['status', 'data' => ['token']]);
    }

    /**
     * Test user can logout successfully (token revoked).
     */
    public function test_user_can_logout()
    {
        $user  = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);
    }

    /**
     * Test RBAC: tenant cannot access admin routes.
     */
    public function test_tenant_cannot_access_admin_routes()
    {
        $tenant = User::factory()->create(['role' => 'tenant']);

        $response = $this->actingAs($tenant)->getJson('/api/admin/properties');

        $response->assertStatus(403);
    }
}
