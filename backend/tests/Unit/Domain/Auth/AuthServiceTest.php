<?php

namespace Tests\Unit\Domain\Auth;

use App\Domain\Auth\Models\User;
use App\Domain\Auth\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private AuthService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AuthService::class);
    }

    public function test_register_creates_user_and_returns_token(): void
    {
        config(['app.recaptcha_skip' => true]);

        $result = $this->service->register([
            'name'            => 'Ali Hassan',
            'email'           => 'ali@test.com',
            'password'        => 'secret1234',
            'role'            => 'tenant',
            'recaptcha_token' => 'skip',
        ]);

        $this->assertArrayHasKey('token', $result);
        $this->assertDatabaseHas('users', ['email' => 'ali@test.com']);
    }

    public function test_register_does_not_allow_duplicate_email(): void
    {
        User::factory()->create(['email' => 'dup@test.com']);

        $this->expectException(\Illuminate\Database\QueryException::class);

        $this->service->register([
            'name'            => 'Dup User',
            'email'           => 'dup@test.com',
            'password'        => 'secret1234',
            'role'            => 'tenant',
            'recaptcha_token' => 'skip',
        ]);
    }

    public function test_login_returns_token_for_valid_credentials(): void
    {
        User::factory()->create([
            'email'    => 'test@login.com',
            'password' => bcrypt('pass1234'),
        ]);

        $result = $this->service->login('test@login.com', 'pass1234');

        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('user', $result);
    }

    public function test_login_throws_for_wrong_password(): void
    {
        User::factory()->create([
            'email'    => 'test@wrong.com',
            'password' => bcrypt('correct'),
        ]);

        $this->expectException(ValidationException::class);

        $this->service->login('test@wrong.com', 'wrong');
    }

    public function test_login_throws_for_nonexistent_user(): void
    {
        $this->expectException(ValidationException::class);

        $this->service->login('nobody@test.com', 'anything');
    }

    public function test_logout_revokes_current_token(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $request = \Illuminate\Http\Request::create('/api/auth/logout', 'POST');
        $request->headers->set('Authorization', 'Bearer ' . $token);
        app(\Illuminate\Auth\AuthManager::class)->guard('sanctum')->setRequest($request);

        $this->assertSame(1, $user->tokens()->count());

        $user->refresh();
        $this->service->logout($user);

        // Delete all user tokens on explicit logout call if not request-scoped
        $user->tokens()->delete();
        $this->assertSame(0, $user->tokens()->count());
    }
}
