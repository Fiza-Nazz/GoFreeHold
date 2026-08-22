<?php

/**
 * Contract domain API routes (Module 4 — Contracts, Leasing & Legal).
 * Loaded by App\Domain\Contract\Providers\ContractServiceProvider.
 */

use App\Domain\Contract\Http\Controllers\CallLogController;
use App\Domain\Contract\Http\Controllers\ContractCaseDocController;
use App\Domain\Contract\Http\Controllers\ContractChequeController;
use App\Domain\Contract\Http\Controllers\ContractController;
use App\Domain\Contract\Http\Controllers\ContractDocController;
use App\Domain\Contract\Http\Controllers\ContractPdfController;
use App\Domain\Contract\Http\Controllers\LegalCaseController;
use App\Domain\Contract\Http\Controllers\TenancyContractController;
use App\Domain\Contract\Http\Controllers\TenancyResController;
use App\Domain\Contract\Http\Controllers\TermController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // Custom actions before apiResource so {contract} never captures them incorrectly
    Route::post('/contracts/{contract}/renew', [ContractController::class, 'renew']);
    Route::post('/contracts/{contract}/vacate', [ContractController::class, 'vacate']);
    Route::post('/contracts/{contract}/settle', [ContractController::class, 'settle']);
    Route::get('/contracts/{contract}/pdf', [ContractPdfController::class, 'generate']);
    Route::put('/contracts/{contract}/on-case', [ContractController::class, 'setOnCase']);

    // Module 4 — Legal case management (prompt.md)
    Route::get('/legal-cases', [LegalCaseController::class, 'index']);
    Route::post('/legal-cases', [LegalCaseController::class, 'store']);
    Route::get('/legal-cases/{legalCase}', [LegalCaseController::class, 'show']);
    Route::put('/legal-cases/{legalCase}', [LegalCaseController::class, 'update']);
    Route::delete('/legal-cases/{legalCase}', [LegalCaseController::class, 'destroy']);
    Route::post('/legal-cases/{legalCase}/documents', [LegalCaseController::class, 'storeDocument']);
    Route::delete('/legal-cases/{legalCase}/documents/{legalCaseDocument}', [LegalCaseController::class, 'destroyDocument']);

    Route::get('/contracts/{contract}/cheques', [ContractChequeController::class, 'index']);
    Route::post('/contracts/{contract}/cheques', [ContractChequeController::class, 'store']);
    Route::put('/contracts/{contract}/cheques/{cheque}', [ContractChequeController::class, 'update']);
    Route::delete('/contracts/{contract}/cheques/{cheque}', [ContractChequeController::class, 'destroy']);
    Route::get('/contracts/{contract}/cheques/{cheque}/receipt', [ContractChequeController::class, 'generateReceipt']);

    Route::get('/contracts/{contract}/case-docs', [ContractCaseDocController::class, 'indexForContract']);
    Route::post('/contracts/{contract}/case-docs', [ContractCaseDocController::class, 'storeForContract']);
    Route::delete('/contracts/{contract}/case-docs/{contractCaseDoc}', [ContractCaseDocController::class, 'destroyForContract']);

    Route::apiResource('contracts', ContractController::class);

    Route::get('/contract-cheques', [ContractChequeController::class, 'index']);

    Route::get('/call-logs', [CallLogController::class, 'index']);
    Route::post('/call-logs', [CallLogController::class, 'store']);
    Route::delete('/call-logs/{callLog}', [CallLogController::class, 'destroy']);

    Route::get('/contract-case-docs', [ContractCaseDocController::class, 'index']);
    Route::post('/contract-case-docs', [ContractCaseDocController::class, 'store']);
    Route::delete('/contract-case-docs/{contractCaseDoc}', [ContractCaseDocController::class, 'destroy']);

    Route::apiResource('tenancy-res', TenancyResController::class)->parameters(['tenancy-res' => 'tenancyRes']);
    Route::apiResource('tenancy-contracts', TenancyContractController::class);
    Route::apiResource('terms', TermController::class);

    Route::get('/contract-docs', [ContractDocController::class, 'index']);
    Route::post('/contract-docs', [ContractDocController::class, 'store']);
    Route::delete('/contract-docs/{contractDoc}', [ContractDocController::class, 'destroy']);
});