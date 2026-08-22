<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\TenancyContract;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenancyContractController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TenancyContract::query();

        if ($request->has('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }

        return response()->json(['status' => 'success', 'data' => ['tenancy_contracts' => $query->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'c1' => 'nullable|string', 'c2' => 'nullable|string',
            'c3' => 'nullable|string', 'c4' => 'nullable|string',
            'c5' => 'nullable|string', 'c6' => 'nullable|string',
            'c7' => 'nullable|string', 'c8' => 'nullable|string',
        ]);

        $addendum = TenancyContract::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Addendum saved.', 'data' => ['tenancy_contract' => $addendum]], 201);
    }

    public function show(TenancyContract $tenancyContract): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['tenancy_contract' => $tenancyContract]]);
    }

    public function update(Request $request, TenancyContract $tenancyContract): JsonResponse
    {
        $validated = $request->validate([
            'c1' => 'nullable|string', 'c2' => 'nullable|string',
            'c3' => 'nullable|string', 'c4' => 'nullable|string',
            'c5' => 'nullable|string', 'c6' => 'nullable|string',
            'c7' => 'nullable|string', 'c8' => 'nullable|string',
        ]);

        $tenancyContract->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Addendum updated.', 'data' => ['tenancy_contract' => $tenancyContract]]);
    }

    public function destroy(TenancyContract $tenancyContract): JsonResponse
    {
        $tenancyContract->delete();

        return response()->json(['status' => 'success', 'message' => 'Addendum deleted.']);
    }
}