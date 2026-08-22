<?php

/**
 * Auth domain API routes.
 * Loaded by App\Domain\Auth\Providers\AuthServiceProvider with prefix "api" + "api" middleware.
 */

use App\Domain\Auth\Http\Controllers\AuthController;
use App\Domain\Auth\Http\Controllers\PasswordResetController;
use Illuminate\Support\Facades\Route;

// ─── Public Auth ───────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
});

// ─── Authenticated Auth ────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
