<?php

/**
 * Dashboard domain API routes (Module 2).
 * Loaded by App\Domain\Dashboard\Providers\DashboardServiceProvider
 * with prefix "api" + "api" middleware.
 */

use App\Domain\Dashboard\Http\Controllers\DashboardController;
use App\Domain\Dashboard\Http\Controllers\LedgerUtilityController;
use App\Domain\Dashboard\Http\Controllers\OwnerFinanceController;
use App\Domain\Dashboard\Http\Controllers\TenantFinanceController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {

    // Admin — dashboard summary + ledger rebuild utility
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'adminSummary']);
        Route::post('/ledger/{contractId}/rebuild', [LedgerUtilityController::class, 'rebuildLedger']);
    });

    // Owner — portfolio, drill-down, vacant filter
    Route::middleware('role:owner')->prefix('owner')->group(function () {
        Route::get('/dashboard/summary', [DashboardController::class, 'ownerSummary']);
        Route::get('/dashboard/properties', [DashboardController::class, 'propertyDrillDown']);
        Route::get('/dashboard/properties/{property}/units', [DashboardController::class, 'propertyUnits']);
        Route::get('/dashboard/units/{unit}', [DashboardController::class, 'unitDetail']);
        Route::get('/dashboard/vacant-units', [DashboardController::class, 'vacantUnits']);

        // Owner-scoped finance views (read-only)
        Route::get('/finance/ledger', [OwnerFinanceController::class, 'ledger']);
        Route::get('/finance/receivables', [OwnerFinanceController::class, 'receivables']);
        Route::get('/finance/payments', [OwnerFinanceController::class, 'payments']);
    });

    // Tenant — finance views (read-only)
    Route::middleware('role:tenant')->prefix('tenant')->group(function () {
        Route::get('/finance/ledger', [TenantFinanceController::class, 'ledger']);
        Route::get('/finance/payments', [TenantFinanceController::class, 'payments']);
    });
});
