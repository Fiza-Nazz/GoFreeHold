<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\CallLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CallLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $contractId = $request->query('contract_id');
        $logs = CallLog::with('loggedBy:id,name')
            ->when($contractId, fn ($q) => $q->where('contract_id', $contractId))
            ->latest('date')
            ->get();

        return response()->json(['status' => 'success', 'data' => ['logs' => $logs]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'date'        => 'required|date',
            'remark'      => 'required|string',
        ]);

        $validated['logged_by'] = $request->user()->id;
        $log = CallLog::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Call log added.',
            'data'    => ['log' => $log->load('loggedBy:id,name')],
        ], 201);
    }

    public function destroy(CallLog $callLog): JsonResponse
    {
        $callLog->delete();

        return response()->json(['status' => 'success', 'message' => 'Log deleted.']);
    }
}