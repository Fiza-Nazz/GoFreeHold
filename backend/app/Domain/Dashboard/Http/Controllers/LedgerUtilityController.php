<?php

namespace App\Domain\Dashboard\Http\Controllers;

use App\Domain\Dashboard\Services\LedgerRebuildService;
use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Financial / ledger utility endpoints for Module 2.
 */
class LedgerUtilityController extends Controller
{
    public function __construct(private readonly LedgerRebuildService $ledgerRebuildService)
    {
    }

    /**
     * Rebuild debit/credit ledger for a contract from source data.
     */
    public function rebuildLedger(Request $request, int $contractId): JsonResponse
    {
        $contract = Contract::findOrFail($contractId);
        $result = $this->ledgerRebuildService->rebuild($contract);

        return response()->json([
            'status'  => 'success',
            'message' => 'Ledger rebuilt successfully for contract.',
            'data'    => $result,
        ]);
    }
}
