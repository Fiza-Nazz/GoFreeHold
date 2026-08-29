<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'John Doe',
            'email'                 => 'johndoe@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'tenant',
            'recaptcha_token'       => 'test-token-bypass',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['status', 'data' => ['token', 'user']]);

        $this->assertDatabaseHas('users', [
            'email' => 'johndoe@example.com',
        ]);
    }

    public function test_user_can_login(): void
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
                 ->assertJsonStructure(['status', 'data' => ['token', 'user']]);
    }

    public function test_user_can_logout(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);
    }

    public function test_register_fails_without_email(): void
    {
        $this->postJson('/api/auth/register', [
            'name'                  => 'No Email',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'tenant',
            'recaptcha_token'       => 'skip',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors(['email']);
    }

    public function test_register_fails_with_short_password(): void
    {
        $this->postJson('/api/auth/register', [
            'name'                  => 'Short Pass',
            'email'                 => 'short@test.com',
            'password'              => '123',
            'password_confirmation' => '123',
            'role'                  => 'tenant',
            'recaptcha_token'       => 'skip',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors(['password']);
    }

    public function test_register_rejects_admin_role_from_public(): void
    {
        $this->postJson('/api/auth/register', [
            'name'                  => 'Hacker',
            'email'                 => 'hacker@test.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'role'                  => 'admin',
            'recaptcha_token'       => 'skip',
        ])->assertUnprocessable()
          ->assertJsonValidationErrors(['role']);
    }

    public function test_me_returns_401_without_token(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }
}
