<?php

namespace App\Domain\Auth\Http\Controllers;

use App\Domain\Auth\Http\Requests\ForgotPasswordRequest;
use App\Domain\Auth\Http\Requests\ResetPasswordRequest;
use App\Domain\Auth\Services\AuthService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Throwable;

class PasswordResetController extends Controller
{
    public function __construct(private readonly AuthService $authService)
    {
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        try {
            $message = $this->authService->sendPasswordResetLink($request->validated('email'));
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'status' => 'error',
                'message' => 'Unable to send the password reset email. Please try again later.',
            ], 503);
        }

        return response()->json([
            'status'  => 'success',
            'message' => $message,
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $message = $this->authService->resetPassword($request->only(
            'email',
            'password',
            'password_confirmation',
            'token'
        ));

        return response()->json([
            'status'  => 'success',
            'message' => $message,
        ]);
    }
}
