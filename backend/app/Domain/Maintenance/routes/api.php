<?php

/**
 * Maintenance domain API routes (Module 7 — Maintenance & Inventory).
 * Loaded by App\Domain\Maintenance\Providers\MaintenanceServiceProvider.
 */

use App\Domain\Maintenance\Http\Controllers\ApplianceController;
use App\Domain\Maintenance\Http\Controllers\ComplaintController;
use App\Domain\Maintenance\Http\Controllers\InventoryController;
use App\Domain\Maintenance\Http\Controllers\JobController;
use App\Domain\Maintenance\Http\Controllers\MaintenanceChargeController;
use App\Domain\Maintenance\Http\Controllers\MaintenanceController;
use App\Domain\Maintenance\Http\Controllers\MaintenanceReportController;
use App\Domain\Maintenance\Http\Controllers\PurchaseController;
use App\Domain\Maintenance\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // ── Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/complaints', [ComplaintController::class, 'index']);
        Route::get('/complaints/{complaint}', [ComplaintController::class, 'show']);
        Route::post('/complaints/{complaint}/assign', [ComplaintController::class, 'assign']);
        Route::post('/complaints/{complaint}/status', [ComplaintController::class, 'updateStatus']);
        Route::get('/technicians', [ComplaintController::class, 'getTechnicians']);

        Route::get('/maintenance/daily-report', [MaintenanceReportController::class, 'dailyReport']);

        Route::apiResource('teams', TeamController::class);
        Route::apiResource('jobs', JobController::class);
        Route::apiResource('maintenance-charges', MaintenanceChargeController::class);
        Route::apiResource('maintenances', MaintenanceController::class);

        Route::apiResource('appliances', ApplianceController::class);

        Route::get('/inventory/warehouse', [InventoryController::class, 'warehouseItems']);
        Route::get('/inventory/unit', [InventoryController::class, 'unitItems']);
        Route::post('/inventory', [InventoryController::class, 'store']);
        Route::put('/inventory/{inventoryItem}', [InventoryController::class, 'update']);
        Route::delete('/inventory/{inventoryItem}', [InventoryController::class, 'destroy']);

        Route::get('/purchases', [PurchaseController::class, 'index']);
        Route::post('/purchases', [PurchaseController::class, 'store']);
        Route::get('/purchases/{purchase}', [PurchaseController::class, 'show']);
        Route::put('/purchases/{purchase}/status', [PurchaseController::class, 'updateStatus']);
        Route::delete('/purchases/{purchase}', [PurchaseController::class, 'destroy']);
    });

    // ── Maintenance role
    Route::middleware('role:maintenance')->prefix('maintenance')->group(function () {
        Route::get('/complaints', [ComplaintController::class, 'index']);
        Route::post('/complaints/{complaint}/status', [ComplaintController::class, 'updateStatus']);
        Route::get('/daily-report', [MaintenanceReportController::class, 'dailyReport']);
    });

    // ── Tenant role
    Route::middleware('role:tenant')->prefix('tenant')->group(function () {
        Route::get('/units', [ComplaintController::class, 'tenantUnits']);
        Route::get('/complaints', [ComplaintController::class, 'index']);
        Route::post('/complaints', [ComplaintController::class, 'store']);
    });
});