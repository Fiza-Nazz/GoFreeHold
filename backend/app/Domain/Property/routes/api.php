<?php

/**
 * Property domain API routes (Module 3 — Property & Unit Management).
 * Loaded by App\Domain\Property\Providers\PropertyServiceProvider.
 */

use App\Domain\Property\Http\Controllers\BookingController;
use App\Domain\Property\Http\Controllers\PropertyController;
use App\Domain\Property\Http\Controllers\OwnerController;
use App\Domain\Property\Http\Controllers\TenantController;
use App\Domain\Property\Http\Controllers\UnitController;
use App\Domain\Property\Http\Controllers\VacantPropertyController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/owners/{owner}/portfolio', [OwnerController::class, 'portfolio']);
    Route::apiResource('owners', OwnerController::class);
    Route::apiResource('tenants', TenantController::class);
    Route::get('/properties/owners', [PropertyController::class, 'getOwners']);
    Route::apiResource('properties', PropertyController::class);

    // Register /units/book before apiResource so {unit} never captures "book"
    Route::post('/units/book', [BookingController::class, 'bookUnit']);
    Route::get('/booking-receipts', [BookingController::class, 'indexReceipts']);
    Route::get('/booking-receipts/{bookingCashReceipt}', [BookingController::class, 'showReceipt']);
    Route::apiResource('units', UnitController::class);

    // Module 3 vacant property report (same URL as before for FE compatibility)
    Route::get('/reports/vacant-properties', VacantPropertyController::class);
});

Route::middleware(['auth:sanctum', 'role:owner,cashier,accountant'])->prefix('owner')->group(function () {
    Route::get('/properties/owners', [PropertyController::class, 'getOwners']);
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::post('/properties', [PropertyController::class, 'storeForOwner']);
    Route::put('/properties/{property}', [PropertyController::class, 'updateForOwner']);
    Route::get('/units', [UnitController::class, 'index']);
    Route::post('/units', [UnitController::class, 'storeForOwner']);
    Route::put('/units/{unit}', [UnitController::class, 'updateForOwner']);
    Route::get('/tenants', [TenantController::class, 'index']);
    Route::post('/tenants', [TenantController::class, 'store']);
    Route::get('/tenants/{tenant}', [TenantController::class, 'show']);
    Route::put('/tenants/{tenant}', [TenantController::class, 'update']);
    Route::get('/reports/vacant-properties', VacantPropertyController::class);
});
