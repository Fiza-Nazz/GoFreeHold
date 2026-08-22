<?php

/**
 * Settlement domain API routes (Module 6 — Move-out Settlements & Financial Tracking).
 * Loaded by App\Domain\Settlement\Providers\SettlementServiceProvider.
 */

use App\Domain\Settlement\Http\Controllers\BankAccountController;
use App\Domain\Settlement\Http\Controllers\CategoryController;
use App\Domain\Settlement\Http\Controllers\ExpenseController;
use App\Domain\Settlement\Http\Controllers\FinancialTrackingController;
use App\Domain\Settlement\Http\Controllers\IncomeController;
use App\Domain\Settlement\Http\Controllers\OutstandingReceivablesController;
use App\Domain\Settlement\Http\Controllers\SettlementController;
use App\Domain\Settlement\Http\Controllers\SettlementDocController;
use App\Domain\Settlement\Http\Controllers\SettlementPaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::put('/settlements/{settlement}/on-case', [SettlementController::class, 'setOnCase']);
    Route::apiResource('settlements', SettlementController::class);

    Route::get('/settlement-docs', [SettlementDocController::class, 'index']);
    Route::post('/settlement-docs', [SettlementDocController::class, 'store']);
    Route::delete('/settlement-docs/{settlementDoc}', [SettlementDocController::class, 'destroy']);

    Route::get('/settlement-payments', [SettlementPaymentController::class, 'index']);
    Route::post('/settlement-payments', [SettlementPaymentController::class, 'store']);
    Route::delete('/settlement-payments/{settlementPayment}', [SettlementPaymentController::class, 'destroy']);

    Route::apiResource('financial-entries', FinancialTrackingController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('categories', CategoryController::class)->except(['show', 'create', 'edit']);
    Route::apiResource('incomes', IncomeController::class);
    Route::apiResource('expenses', ExpenseController::class);

    Route::get('/banks', [BankAccountController::class, 'banks']);
    Route::apiResource('bank-accounts', BankAccountController::class);

    Route::get('/receivables/categorized', [OutstandingReceivablesController::class, 'report']);
});