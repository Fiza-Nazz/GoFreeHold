<?php

/**
 * Report domain API routes (Module 8 — System Reports & Automated Notifications).
 * Loaded by App\Domain\Report\Providers\ReportServiceProvider.
 *
 * vacant-properties JSON remains in Domain\Property (Module 3).
 */

use App\Domain\Report\Http\Controllers\NotificationSettingController;
use App\Domain\Report\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/reports/revenue', [ReportController::class, 'revenueAnalysis']);
    Route::get('/reports/receivables', [ReportController::class, 'receivablesReport']);
    Route::get('/reports/expired-contracts', [ReportController::class, 'expiredContractsReport']);
    Route::get('/reports/inventory-summary', [ReportController::class, 'inventorySummary']);
    Route::get('/reports/historical-ledgers', [ReportController::class, 'historicalLedgers']);
    // Plan: Excel (.xlsx) via Maatwebsite — not CSV
    Route::get('/reports/export/{type}', [ReportController::class, 'exportExcel']);

    Route::get('/settings/notifications', [NotificationSettingController::class, 'index']);
    Route::put('/settings/notifications/{notificationSetting}', [NotificationSettingController::class, 'update']);
});