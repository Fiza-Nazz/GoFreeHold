<?php

use App\Domain\Accounting\Http\Controllers\AccountingReportController;
use App\Domain\Accounting\Http\Controllers\ChartAccountController;
use App\Domain\Accounting\Http\Controllers\JournalController;
use Illuminate\Support\Facades\Route;

// Owner & Staff Accounting Routes
Route::middleware(['auth:sanctum', 'role:owner,accountant,cashier'])->prefix('owner/accounting')->group(function () {
    // 1. Chart of Accounts (Read: owner, accountant, cashier)
    Route::get('/chart-accounts', [ChartAccountController::class, 'index']);
    Route::get('/chart-accounts/tree', [ChartAccountController::class, 'tree']);
    Route::get('/chart-accounts/{id}', [ChartAccountController::class, 'show']);

    // 2. Journals (Read: owner, accountant, cashier)
    Route::get('/journals', [JournalController::class, 'index']);
    Route::get('/journals/{id}', [JournalController::class, 'show']);

    // 3. Reports (Read: owner, accountant, cashier)
    Route::prefix('reports')->group(function () {
        Route::get('/trial-balance', [AccountingReportController::class, 'trialBalance']);
        Route::get('/income-statement', [AccountingReportController::class, 'incomeStatement']);
        Route::get('/balance-sheet', [AccountingReportController::class, 'balanceSheet']);
        Route::get('/cash-flow', [AccountingReportController::class, 'cashFlow']);
        Route::get('/cash-running', [AccountingReportController::class, 'cashRunning']);
    });
    Route::get('/accounts/{id}/ledger', [AccountingReportController::class, 'accountLedger']);

    // Write Operations: Owner & Accountant ONLY
    Route::middleware('role:owner,accountant')->group(function () {
        Route::post('/chart-accounts', [ChartAccountController::class, 'store']);
        Route::put('/chart-accounts/{id}', [ChartAccountController::class, 'update']);
        Route::delete('/chart-accounts/{id}', [ChartAccountController::class, 'destroy']);
        Route::post('/chart-accounts/seed-default', [ChartAccountController::class, 'seedDefault']);

        Route::post('/journals', [JournalController::class, 'store']);
        Route::post('/journals/{id}/reverse', [JournalController::class, 'reverse']);
    });
});

// Optional Staff Finance Aliases (Read-Only)
Route::middleware(['auth:sanctum', 'role:owner,accountant,cashier'])->prefix('staff/finance/accounting')->group(function () {
    Route::get('/chart-accounts', [ChartAccountController::class, 'index']);
    Route::get('/chart-accounts/tree', [ChartAccountController::class, 'tree']);
    Route::get('/journals', [JournalController::class, 'index']);
    Route::get('/journals/{id}', [JournalController::class, 'show']);

    Route::prefix('reports')->group(function () {
        Route::get('/trial-balance', [AccountingReportController::class, 'trialBalance']);
        Route::get('/income-statement', [AccountingReportController::class, 'incomeStatement']);
        Route::get('/balance-sheet', [AccountingReportController::class, 'balanceSheet']);
        Route::get('/cash-flow', [AccountingReportController::class, 'cashFlow']);
        Route::get('/cash-running', [AccountingReportController::class, 'cashRunning']);
    });
    Route::get('/accounts/{id}/ledger', [AccountingReportController::class, 'accountLedger']);
});
