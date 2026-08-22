<?php

namespace App\Domain\Auth\Services;

use App\Domain\Auth\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Verify Google reCAPTCHA token.
     * Uses RECAPTCHA_SECRET_KEY from .env (required).
     */
    public function verifyRecaptcha(?string $token): void
    {
        if (filter_var(env('RECAPTCHA_SKIP', false), FILTER_VALIDATE_BOOLEAN)) {
            return;
        }

        $secret = env('RECAPTCHA_SECRET_KEY');

        if (empty($secret)) {
            throw ValidationException::withMessages([
                'recaptcha_token' => ['reCAPTCHA is not configured on the server.'],
            ]);
        }

        if (empty($token)) {
            throw ValidationException::withMessages([
                'recaptcha_token' => ['reCAPTCHA token is required.'],
            ]);
        }

        $response = Http::withoutVerifying()
            ->asForm()
            ->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret'   => $secret,
                'response' => $token,
                'remoteip' => request()->ip(),
            ]);

        $data = $response->json() ?? [];

        if (! ($data['success'] ?? false)) {
            $codes = $data['error-codes'] ?? [];
            $message = 'Invalid reCAPTCHA. Please try again.';

            if (in_array('hostname-mismatch', $codes, true)) {
                $message = 'reCAPTCHA domain mismatch. In Google reCAPTCHA settings add both localhost and 127.0.0.1, then try again.';
            } elseif (in_array('timeout-or-duplicate', $codes, true)) {
                $message = 'reCAPTCHA expired or already used. Please tick the checkbox again.';
            } elseif (in_array('invalid-input-secret', $codes, true)) {
                $message = 'reCAPTCHA secret key is invalid. Check RECAPTCHA_SECRET_KEY in backend .env.';
            } elseif (in_array('invalid-input-response', $codes, true)) {
                $message = 'reCAPTCHA token invalid. Refresh the page, tick the checkbox once, then submit immediately.';
            } elseif (! empty($codes)) {
                $message = 'Invalid reCAPTCHA ('.implode(', ', $codes).'). Please try again.';
            }

            throw ValidationException::withMessages([
                'recaptcha_token' => [$message],
            ]);
        }
    }

    /**
     * Register a new user in the system.
     * Triggers: Validates reCAPTCHA token if provided.
     * Side-effects: Creates a new User record in the database and generates an API token for authentication.
     *
     * @param array $data The user registration data
     * @return array Returns the created user resource and their API token
     */
    public function register(array $data): array
    {
        $this->verifyRecaptcha($data['recaptcha_token'] ?? null);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'], // hashed via cast
            'role'     => $data['role'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user'  => (new UserResource($user))->resolve(),
            'token' => $token,
        ];
    }

    /**
     * Authenticate an existing user.
     * Triggers: Verifies user credentials against the database.
     * Side-effects: Generates a new API token for the authenticated user.
     *
     * @param string $email
     * @param string $password
     * @return array Returns the authenticated user resource and their API token
     * @throws ValidationException If credentials do not match
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user'  => (new UserResource($user))->resolve(),
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();

        // Sanctum API tokens (Bearer) — revoke the current personal access token
        if ($token instanceof \Laravel\Sanctum\PersonalAccessToken) {
            $token->delete();
            return;
        }

        // Fallback: delete by id when available
        if ($token && isset($token->id)) {
            $user->tokens()->where('id', $token->id)->delete();
        }
    }

    public function sendPasswordResetLink(string $email): string
    {
        $status = Password::broker()->sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return __($status);
    }

    public function resetPassword(array $credentials): string
    {
        $status = Password::broker()->reset(
            $credentials,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password, // hashed via cast
                ])->setRememberToken(Str::random(60));

                $user->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return __($status);
    }
}
