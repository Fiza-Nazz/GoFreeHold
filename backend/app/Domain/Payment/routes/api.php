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

Route::middleware(['auth:sanctum', 'role:cashier,accountant'])->prefix('staff/finance')->group(function () {
    $c = \App\Domain\Payment\Http\Controllers\StaffFinanceController::class;
    Route::get('/summary', [$c, 'summary']);
    Route::get('/contracts', [$c, 'contracts']);
    Route::get('/payments', [$c, 'index']);
    Route::post('/payments', [$c, 'store']);
    Route::get('/payments/{payment}/receipt', [$c, 'receipt']);
    Route::get('/payments/{payment}', [$c, 'show']);
    Route::get('/ledger', [$c, 'ledger']);
    Route::get('/receivables', [$c, 'receivables']);
});

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

Route::middleware(['auth:sanctum', 'role:owner,cashier,accountant'])->prefix('owner')->group(function () {
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);
    Route::get('/rent-ledger', [RentTransactionController::class, 'index']);
    Route::get('/ledger', [RentTransactionController::class, 'index']);
    Route::get('/ledger/receivables', [RentTransactionController::class, 'receivablesSummary']);
    Route::get('/receivables', [RentTransactionController::class, 'receivablesSummary']);
    Route::post('/rent-transactions', [RentTransactionController::class, 'store']);
    Route::delete('/ledger/{rentTransaction}/soft-delete', [RentTransactionController::class, 'softDelete']);
    Route::get('/service-charges', [ServiceChargeController::class, 'index']);
    Route::post('/service-charges', [ServiceChargeController::class, 'store']);
    Route::put('/service-charges/{serviceCharge}', [ServiceChargeController::class, 'update']);
    Route::delete('/service-charges/{serviceCharge}', [ServiceChargeController::class, 'destroy']);
    Route::apiResource('contract-payables', ContractPayableController::class);
});
