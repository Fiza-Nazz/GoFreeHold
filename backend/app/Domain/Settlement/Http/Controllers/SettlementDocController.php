<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\SettlementDoc;
use App\Domain\Settlement\Services\SettlementService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettlementDocController extends Controller
{
    public function __construct(private readonly SettlementService $settlementService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = SettlementDoc::query();

        if ($request->has('settlement_id')) {
            $query->where('settlement_id', $request->settlement_id);
        }

        return response()->json(['status' => 'success', 'data' => ['docs' => $query->latest()->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settlement_id' => 'required|exists:settlements,id',
            'file'          => 'required|file|max:10240',
        ]);

        $doc = $this->settlementService->storeDocument($validated['settlement_id'], $request->file('file'));

        return response()->json(['status' => 'success', 'message' => 'Settlement document uploaded.', 'data' => ['doc' => $doc]], 201);
    }

    public function destroy(SettlementDoc $settlementDoc): JsonResponse
    {
        $this->settlementService->deleteDocument($settlementDoc);

        return response()->json(['status' => 'success', 'message' => 'Settlement document deleted.']);
    }
}
