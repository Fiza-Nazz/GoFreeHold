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
    Route::post('/staff-invitations/accept', [\App\Domain\Auth\Http\Controllers\OwnerStaffController::class, 'accept'])->middleware('throttle:10,1');
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);
});

Route::middleware(['auth:sanctum', 'role:owner'])->prefix('owner/staff')->group(function () {
    $controller = \App\Domain\Auth\Http\Controllers\OwnerStaffController::class;
    Route::get('/', [$controller, 'index']);
    Route::post('/', [$controller, 'store'])->middleware('throttle:20,1');
    Route::get('/{staff}', [$controller, 'show']);
    Route::patch('/{staff}', [$controller, 'update']);
    Route::post('/{staff}/disable', [$controller, 'disable']);
    Route::post('/{staff}/enable', [$controller, 'enable']);
    Route::post('/{staff}/invite', [$controller, 'invite'])->middleware('throttle:5,1');
});

// ─── Authenticated Auth ────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
