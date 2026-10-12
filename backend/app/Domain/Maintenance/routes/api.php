<?php

/**
 * Maintenance domain API routes (Module 7 — Maintenance & Inventory).
 * Loaded by App\Domain\Maintenance\Providers\MaintenanceServiceProvider.
 */

use App\Domain\Maintenance\Http\Controllers\ApplianceController;
use App\Domain\Maintenance\Http\Controllers\ComplaintController;
use App\Domain\Maintenance\Http\Controllers\InventoryController;
use App\Domain\Maintenance\Http\Controllers\ItemController;
use App\Domain\Maintenance\Http\Controllers\ItemStoreController;
use App\Domain\Maintenance\Http\Controllers\JobController;
use App\Domain\Maintenance\Http\Controllers\MaintenanceChargeController;
use App\Domain\Maintenance\Http\Controllers\MaintenanceController;
use App\Domain\Maintenance\Http\Controllers\MaintenanceReportController;
use App\Domain\Maintenance\Http\Controllers\PurchaseController;
use App\Domain\Maintenance\Http\Controllers\TeamController;
use App\Domain\Maintenance\Http\Controllers\UnitItemController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // ── Admin (Platform Admin should not CRUD customer inventory)
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

        // Deprecated operational admin inventory & appliances (403 role boundary)
        Route::any('/inventory/{any?}', function () {
            return response()->json([
                'message' => 'Platform admin does not manage organization inventory. Use Owner portal (/api/owner/inventory/*).',
                'code'    => 'ROLE_BOUNDARY_RESTRICTION',
            ], 403);
        })->where('any', '.*');

        Route::any('/appliances/{any?}', function () {
            return response()->json([
                'message' => 'Platform admin does not manage organization inventory. Use Owner portal (/api/owner/appliances).',
                'code'    => 'ROLE_BOUNDARY_RESTRICTION',
            ], 403);
        })->where('any', '.*');

        Route::apiResource('items', ItemController::class);
        Route::apiResource('unit-items', UnitItemController::class);
        Route::apiResource('item-store', ItemStoreController::class)->parameters(['item-store' => 'itemStore']);

        Route::get('/purchases', [PurchaseController::class, 'index']);
        Route::post('/purchases', [PurchaseController::class, 'store']);
        Route::get('/purchases/{purchase}', [PurchaseController::class, 'show']);
        Route::put('/purchases/{purchase}/status', [PurchaseController::class, 'updateStatus']);
        Route::delete('/purchases/{purchase}', [PurchaseController::class, 'destroy']);
    });

    // ── Maintenance role
    Route::middleware('role:maintenance')->prefix('maintenance')->group(function () {
        Route::get('/jobs', [\App\Domain\Maintenance\Http\Controllers\StaffJobController::class, 'index']);
        Route::get('/jobs/{job}', [\App\Domain\Maintenance\Http\Controllers\StaffJobController::class, 'show']);
        Route::post('/jobs/{job}/status', [\App\Domain\Maintenance\Http\Controllers\StaffJobController::class, 'status']);
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

    // ── Owner role (Maintenance & Complaints Dispatching + Unified Inventory Operations)
    Route::middleware('role:owner,cashier,accountant')->prefix('owner')->group(function () {
        Route::get('/complaints', [ComplaintController::class, 'index']);
        Route::get('/complaints/{complaint}', [ComplaintController::class, 'show']);
        Route::post('/complaints/{complaint}/assign', [ComplaintController::class, 'assign']);
        Route::post('/complaints/{complaint}/status', [ComplaintController::class, 'updateStatus']);
        Route::get('/technicians', [ComplaintController::class, 'getTechnicians']);

        // Compatibility aliases for legacy appliances UI
        Route::get('/appliances', [ApplianceController::class, 'index']);
        Route::post('/appliances', [ApplianceController::class, 'store']);
        Route::get('/appliances/{appliance}', [ApplianceController::class, 'show']);
        Route::put('/appliances/{appliance}', [ApplianceController::class, 'update']);
        Route::delete('/appliances/{appliance}', [ApplianceController::class, 'destroy']);

        Route::get('/jobs', [JobController::class, 'index']);
        Route::post('/jobs', [JobController::class, 'store']);
        Route::get('/jobs/{job}', [JobController::class, 'show']);
        Route::put('/jobs/{job}', [JobController::class, 'update']);
        Route::delete('/jobs/{job}', [JobController::class, 'destroy']);

        Route::get('/teams', [TeamController::class, 'index']);
        Route::post('/teams', [TeamController::class, 'store']);
        Route::get('/teams/{team}', [TeamController::class, 'show']);
        Route::put('/teams/{team}', [TeamController::class, 'update']);
        Route::delete('/teams/{team}', [TeamController::class, 'destroy']);

        Route::get('/maintenances', [MaintenanceController::class, 'index']);
        Route::get('/maintenance/daily-report', [MaintenanceReportController::class, 'dailyReport']);
        Route::get('/daily-maintenance', [MaintenanceReportController::class, 'dailyReport']);

        // Unified Inventory APIs (Option A)
        Route::get('/inventory/warehouse', [InventoryController::class, 'warehouseItems']);
        Route::get('/inventory/unit', [InventoryController::class, 'unitItems']);
        Route::get('/inventory', [InventoryController::class, 'index']);
        Route::post('/inventory', [InventoryController::class, 'store']);
        Route::get('/inventory/{inventoryItem}', [InventoryController::class, 'show']);
        Route::put('/inventory/{inventoryItem}', [InventoryController::class, 'update']);
        Route::delete('/inventory/{inventoryItem}', [InventoryController::class, 'destroy']);
        Route::post('/inventory/{inventoryItem}/transfer', [InventoryController::class, 'transfer']);
        Route::get('/units/{unit}/inventory-addendum', [InventoryController::class, 'addendum']);

        Route::get('/item-store', [ItemStoreController::class, 'index']);
        Route::post('/item-store', [ItemStoreController::class, 'store']);

        Route::get('/purchases', [PurchaseController::class, 'index']);
        Route::post('/purchases', [PurchaseController::class, 'store']);
        Route::get('/purchases/{purchase}', [PurchaseController::class, 'show']);
        Route::put('/purchases/{purchase}/status', [PurchaseController::class, 'updateStatus']);
        Route::delete('/purchases/{purchase}', [PurchaseController::class, 'destroy']);
        Route::get('/purchase-orders', [PurchaseController::class, 'index']);
    });
});
