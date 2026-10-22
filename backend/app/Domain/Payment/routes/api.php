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
use App\Domain\Payment\Http\Controllers\ServiceChargeDocController;
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
    Route::get('/properties/{property}/unit-board', [\App\Domain\Property\Http\Controllers\PropertyUnitBoardController::class, 'show']);
    Route::get('/units/{unit}', [\App\Domain\Property\Http\Controllers\UnitDetailController::class, 'show']);
    Route::get('/contracts/{contract}/vacate-summary', [\App\Domain\Contract\Http\Controllers\ContractController::class, 'vacateSummary']);

    // Staff Finance aliases for Service Charges
    Route::get('/service-charges/summary', [ServiceChargeController::class, 'summary']);
    Route::get('/service-charges', [ServiceChargeController::class, 'index']);
    Route::post('/service-charges', [ServiceChargeController::class, 'store']);
    Route::get('/service-charges/{serviceCharge}', [ServiceChargeController::class, 'show']);
    Route::put('/service-charges/{serviceCharge}', [ServiceChargeController::class, 'update']);
    Route::delete('/service-charges/{serviceCharge}', [ServiceChargeController::class, 'destroy']);

    Route::get('/service-charge-payments', [ServiceChargePaymentController::class, 'index']);
    Route::post('/service-charge-payments', [ServiceChargePaymentController::class, 'store']);
    Route::delete('/service-charge-payments/{serviceChargePayment}', [ServiceChargePaymentController::class, 'destroy']);

    Route::get('/service-charge-docs', [ServiceChargeDocController::class, 'index']);
    Route::post('/service-charge-docs', [ServiceChargeDocController::class, 'store']);
    Route::get('/service-charge-docs/{id}/download', [ServiceChargeDocController::class, 'download']);
    Route::delete('/service-charge-docs/{id}', [ServiceChargeDocController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::apiResource('payments', PaymentController::class)->except(['update', 'create', 'edit']);

    // Static ledger paths before {rentTransaction} segments
    Route::get('/ledger', [RentTransactionController::class, 'index']);
    Route::get('/rent-ledger', [RentTransactionController::class, 'index']); // plan path
    Route::get('/ledger/receivables', [RentTransactionController::class, 'receivablesSummary']);
    Route::delete('/ledger/{rentTransaction}/soft-delete', [RentTransactionController::class, 'softDelete']);
    Route::get('/properties/{property}/unit-board', [\App\Domain\Property\Http\Controllers\PropertyUnitBoardController::class, 'show']);
    Route::get('/ledger/{rentTransaction}/audit-log', [RentTransactionController::class, 'auditLog']);
    Route::apiResource('rent-transactions', RentTransactionController::class);

    Route::apiResource('service-charges', ServiceChargeController::class)->except(['create', 'edit']);
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
    Route::get('/properties/{property}/unit-board', [\App\Domain\Property\Http\Controllers\PropertyUnitBoardController::class, 'show']);
    Route::get('/units/{unit}/detail', [\App\Domain\Property\Http\Controllers\UnitDetailController::class, 'show']);

    // Owner Service Charges & Analytics
    Route::get('/service-charges/summary', [ServiceChargeController::class, 'summary']);
    Route::get('/service-charges', [ServiceChargeController::class, 'index']);
    Route::post('/service-charges', [ServiceChargeController::class, 'store']);
    Route::get('/service-charges/{serviceCharge}', [ServiceChargeController::class, 'show']);
    Route::put('/service-charges/{serviceCharge}', [ServiceChargeController::class, 'update']);
    Route::delete('/service-charges/{serviceCharge}', [ServiceChargeController::class, 'destroy']);

    // Owner Service Charge Payments
    Route::get('/service-charge-payments', [ServiceChargePaymentController::class, 'index']);
    Route::post('/service-charge-payments', [ServiceChargePaymentController::class, 'store']);
    Route::delete('/service-charge-payments/{serviceChargePayment}', [ServiceChargePaymentController::class, 'destroy']);

    // Owner Service Charge Documents (OA/PM Invoices)
    Route::get('/service-charge-docs', [ServiceChargeDocController::class, 'index']);
    Route::post('/service-charge-docs', [ServiceChargeDocController::class, 'store']);
    Route::get('/service-charge-docs/{id}/download', [ServiceChargeDocController::class, 'download']);
    Route::delete('/service-charge-docs/{id}', [ServiceChargeDocController::class, 'destroy']);

    Route::apiResource('contract-payables', ContractPayableController::class);
});
