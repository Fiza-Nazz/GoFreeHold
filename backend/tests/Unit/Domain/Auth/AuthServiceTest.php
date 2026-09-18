<?php

namespace Tests\Unit\Domain\Auth;

use App\Domain\Auth\Models\User;
use App\Domain\Auth\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

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
        $createdToken = $user->createToken('auth_token');
        $token = $createdToken->plainTextToken;
        $tokenId = $createdToken->accessToken->id;
        $this->assertSame(1, $user->tokens()->count());

        $this->withToken($token)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully');

        $this->assertSame(0, $user->tokens()->count());
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
    }

    public function test_recaptcha_connection_failure_cannot_create_an_account(): void
    {
        $this->assertRecaptchaRejectsRegistration(function () {
            throw new ConnectionException('Simulated TLS/network failure');
        });
    }

    public function test_invalid_recaptcha_cannot_create_an_account(): void
    {
        $this->assertRecaptchaRejectsRegistration(fn () => Http::response(['success' => false], 200));
    }

    private function assertRecaptchaRejectsRegistration(callable $response): void
    {
        $oldSettings = config('services.recaptcha');
        config(['services.recaptcha.skip' => false, 'services.recaptcha.secret_key' => 'isolated-test-secret']);
        Http::fake(['www.google.com/recaptcha/api/siteverify' => $response]);
        try {
            try {
                $this->service->register([
                    'name' => 'Rejected Verification', 'email' => 'rejected@example.test',
                    'password' => 'Synthetic-Password-123', 'role' => 'owner',
                    'recaptcha_token' => 'synthetic-invalid-token',
                ]);
                $this->fail('Registration must fail when verification fails.');
            } catch (ValidationException $exception) {
                $this->assertArrayHasKey('recaptcha_token', $exception->errors());
            }
            $this->assertDatabaseMissing('users', ['email' => 'rejected@example.test']);
            $this->assertDatabaseCount('owners', 0);
            $this->assertDatabaseCount('personal_access_tokens', 0);
        } finally {
            config(['services.recaptcha' => $oldSettings]);
        }
    }
}
