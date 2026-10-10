<?php

/**
 * Platform Domain API routes (Platform Admin multi-tenancy system).
 * Loaded by App\Domain\Platform\Providers\PlatformServiceProvider with prefix "api".
 */

use App\Domain\Platform\Http\Controllers\AuditLogController;
use App\Domain\Platform\Http\Controllers\ImpersonationController;
use App\Domain\Platform\Http\Controllers\OrganizationController;
use App\Domain\Platform\Http\Controllers\PlanController;
use App\Domain\Platform\Http\Controllers\PlatformDashboardController;
use App\Domain\Platform\Http\Controllers\PlatformSettingController;
use App\Domain\Platform\Http\Controllers\PlatformUserController;
use App\Domain\Platform\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

// Exit impersonation must be accessible by the active impersonated session (any role)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/admin/impersonations/exit', [ImpersonationController::class, 'exit']);
});

// Platform Admin routes — role: admin only
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // 1. Dashboard
    Route::get('/dashboard', [PlatformDashboardController::class, 'index']);

    // 2. Organizations
    Route::get('/organizations', [OrganizationController::class, 'index']);
    Route::post('/organizations', [OrganizationController::class, 'store']);
    Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);
    Route::put('/organizations/{organization}', [OrganizationController::class, 'update']);
    Route::post('/organizations/{organization}/suspend', [OrganizationController::class, 'suspend']);
    Route::post('/organizations/{organization}/reactivate', [OrganizationController::class, 'reactivate']);

    // 3. Platform Users
    Route::get('/users', [PlatformUserController::class, 'index']);
    Route::post('/users', [PlatformUserController::class, 'store']);
    Route::put('/users/{user}', [PlatformUserController::class, 'update']);
    Route::post('/users/{user}/disable', [PlatformUserController::class, 'disable']);
    Route::post('/users/{user}/enable', [PlatformUserController::class, 'enable']);

    // 4. Plans & Subscriptions
    Route::get('/plans', [PlanController::class, 'index']);
    Route::post('/plans', [PlanController::class, 'store']);
    Route::put('/plans/{plan}', [PlanController::class, 'update']);

    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::put('/subscriptions/{subscription}', [SubscriptionController::class, 'update']);

    // 5. Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index']);

    // 6. Platform Settings
    Route::get('/settings', [PlatformSettingController::class, 'show']);
    Route::put('/settings', [PlatformSettingController::class, 'update']);

    // 7. Support Impersonation start
    Route::post('/impersonations', [ImpersonationController::class, 'start']);
});
