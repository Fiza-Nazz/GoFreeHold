<?php

use Illuminate\Support\Facades\Route;

/*
| Auth domain routes (register/login/logout/forgot/reset + /user) live in:
|   app/Domain/Auth/routes/api.php
| and are registered by App\Domain\Auth\Providers\AuthServiceProvider.
*/

// ─── Protected Routes (Requires Login) ────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    /*
    | Module 2 Dashboard routes (owner dashboard + admin ledger rebuild) live in:
    |   app/Domain/Dashboard/routes/api.php
    | registered by App\Domain\Dashboard\Providers\DashboardServiceProvider.
    */

    // ── Admin Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Access & Parties (real schema) — plan: /api/owners & /api/tenants full CRUD
        Route::get('/owners/{owner}/portfolio', [\App\Http\Controllers\Api\OwnerController::class, 'portfolio']);
        Route::apiResource('owners', \App\Http\Controllers\Api\OwnerController::class);
        Route::apiResource('tenants', \App\Http\Controllers\Api\TenantController::class);

        /*
        | Module 3 Property & Unit routes live in:
        |   app/Domain/Property/routes/api.php
        | registered by App\Domain\Property\Providers\PropertyServiceProvider.
        */

        // Property inventory (real schema: items / unit_items / item_store)
        Route::apiResource('items', \App\Http\Controllers\Api\ItemController::class);
        Route::apiResource('unit-items', \App\Http\Controllers\Api\UnitItemController::class);
        Route::apiResource('item-store', \App\Http\Controllers\Api\ItemStoreController::class)->parameters(['item-store' => 'itemStore']);

        /*
        | Module 4 Contracts, Leasing & Legal routes live in:
        |   app/Domain/Contract/routes/api.php
        | registered by App\Domain\Contract\Providers\ContractServiceProvider.
        */

        /*
        | Module 5 Payments, Receivables & Payables routes live in:
        |   app/Domain/Payment/routes/api.php
        | registered by App\Domain\Payment\Providers\PaymentServiceProvider.
        |
        | Module 6 Settlements & Financial Tracking routes live in:
        |   app/Domain/Settlement/routes/api.php
        | registered by App\Domain\Settlement\Providers\SettlementServiceProvider.
        */

        /*
        | Module 7 Maintenance & Inventory routes live in:
        |   app/Domain/Maintenance/routes/api.php
        | registered by App\Domain\Maintenance\Providers\MaintenanceServiceProvider.
        | (admin + maintenance role + tenant complaint routes)
        */

        /*
        | Module 8 Reports & Notifications routes live in:
        |   app/Domain/Report/routes/api.php
        | registered by App\Domain\Report\Providers\ReportServiceProvider.
        | vacant-properties JSON → Domain\Property (Module 3)
        */
    });

    /*
    | Tenant + maintenance role complaint/daily-report routes → Domain\Maintenance
    */

});
