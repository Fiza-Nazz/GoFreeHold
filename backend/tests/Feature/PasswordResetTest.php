<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Exception\TransportException;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_real_email_render_and_password_reset_round_trip(): void
    {
        $user = User::factory()->create(['password' => 'OldPassword123!']);
        $response = $this->postJson('/api/auth/forgot-password', ['email' => $user->email]);
        $response->assertOk()->assertJsonPath('status', 'success');
        $messages = Mail::mailer()->getSymfonyTransport()->messages();
        $this->assertCount(1, $messages);
        $html = $messages->first()->getOriginalMessage()->getHtmlBody();
        $this->assertStringContainsString('Reset your password', $html);
        preg_match('~/reset-password/([a-zA-Z0-9]+)~', $html, $matches);
        $this->assertNotEmpty($matches[1] ?? null);
        $this->assertStringNotContainsString($matches[1], $response->getContent());

        $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $matches[1],
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])->assertOk();
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'OldPassword123!'])
            ->assertUnprocessable();
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'NewPassword123!'])
            ->assertOk()->assertJsonStructure(['data' => ['token']]);
    }

    public function test_mail_transport_failure_returns_safe_json(): void
    {
        $user = User::factory()->create();
        Mail::shouldReceive('mailer')->andThrow(new TransportException('Private SMTP details'));

        $response = $this->postJson('/api/auth/forgot-password', ['email' => $user->email]);
        $response->assertStatus(503)->assertJsonPath('status', 'error');
        $this->assertStringNotContainsString('Private SMTP details', $response->getContent());
        $this->assertStringNotContainsString('<html', $response->getContent());
    }
}
