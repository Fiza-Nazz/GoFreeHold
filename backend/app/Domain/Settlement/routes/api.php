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

Route::middleware(['auth:sanctum', 'role:owner,cashier,accountant'])->prefix('owner')->group(function () {
    Route::get('/settlements', [SettlementController::class, 'index']);
    Route::post('/settlements', [SettlementController::class, 'store']);
    Route::get('/settlements/{settlement}', [SettlementController::class, 'show']);
    Route::put('/settlements/{settlement}', [SettlementController::class, 'update']);
    Route::post('/settlements/{settlement}/documents', [SettlementController::class, 'storeDocument']);
    Route::post('/settlements/{settlement}/payments', [SettlementController::class, 'storePayment']);

    Route::get('/settlement-payments', [SettlementPaymentController::class, 'index']);
    Route::get('/financial-entries', [FinancialTrackingController::class, 'index']);
    Route::post('/financial-entries', [FinancialTrackingController::class, 'store']);
    Route::delete('/financial-entries/{financial_entry}', [FinancialTrackingController::class, 'destroy']);
    Route::get('/receivables/categorized', [OutstandingReceivablesController::class, 'report']);

    Route::get('/banks', [BankAccountController::class, 'banks']);
    Route::get('/bank-accounts', [BankAccountController::class, 'index']);
    Route::post('/bank-accounts', [BankAccountController::class, 'store']);
    Route::put('/bank-accounts/{bankAccount}', [BankAccountController::class, 'update']);
    Route::delete('/bank-accounts/{bankAccount}', [BankAccountController::class, 'destroy']);
});