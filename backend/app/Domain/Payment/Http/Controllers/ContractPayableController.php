<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Payment\Models\ContractPayable;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractPayableController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ContractPayable::with('contract:id,unit_id,tenant_id');

        if ($request->has('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(['status' => 'success', 'data' => ['payables' => $query->latest()->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'description' => 'nullable|string|max:500',
            'amount'      => 'required|numeric|min:0',
            'due_date'    => 'nullable|date',
            'status'      => 'nullable|in:pending,paid',
        ]);

        $payable = ContractPayable::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Payable created.', 'data' => ['payable' => $payable]], 201);
    }

    public function show(ContractPayable $contractPayable): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['payable' => $contractPayable->load('contract')]]);
    }

    public function update(Request $request, ContractPayable $contractPayable): JsonResponse
    {
        $validated = $request->validate([
            'description' => 'nullable|string|max:500',
            'amount'      => 'numeric|min:0',
            'due_date'    => 'nullable|date',
            'status'      => 'in:pending,paid',
        ]);

        $contractPayable->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Payable updated.', 'data' => ['payable' => $contractPayable]]);
    }

    public function destroy(ContractPayable $contractPayable): JsonResponse
    {
        $contractPayable->delete();

        return response()->json(['status' => 'success', 'message' => 'Payable deleted.']);
    }
}