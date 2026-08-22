<?php

/**
 * Payment domain API routes (Module 5 — Payments, Receivables & Payables).
 * Loaded by App\Domain\Payment\Providers\PaymentServiceProvider.
 */

use App\Domain\Payment\Http\Controllers\ContractPayableController;
use App\Domain\Payment\Http\Controllers\PayableController;
use App\Domain\Payment\Http\Controllers\PaymentController;
use App\Domain\Payment\Http\Controllers\RentTransactionController;
use App\Domain\Payment\Http\Controllers\ServiceChargeController;
use App\Domain\Payment\Http\Controllers\ServiceChargePaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('payments', PaymentController::class)->except(['update', 'create', 'edit']);

    // Static ledger paths before {rentTransaction} segments
    Route::get('/ledger', [RentTransactionController::class, 'index']);
    Route::get('/rent-ledger', [RentTransactionController::class, 'index']); // plan path
    Route::get('/ledger/receivables', [RentTransactionController::class, 'receivablesSummary']);
    Route::delete('/ledger/{rentTransaction}/soft-delete', [RentTransactionController::class, 'softDelete']);
    Route::get('/ledger/{rentTransaction}/audit-log', [RentTransactionController::class, 'auditLog']);
    Route::apiResource('rent-transactions', RentTransactionController::class);

    Route::apiResource('service-charges', ServiceChargeController::class)->except(['show', 'create', 'edit']);
    Route::get('/service-charge-payments', [ServiceChargePaymentController::class, 'index']);
    Route::post('/service-charge-payments', [ServiceChargePaymentController::class, 'store']);
    Route::delete('/service-charge-payments/{serviceChargePayment}', [ServiceChargePaymentController::class, 'destroy']);

    Route::get('/payables/summary', [PayableController::class, 'summary']);
    Route::apiResource('contract-payables', ContractPayableController::class);
});