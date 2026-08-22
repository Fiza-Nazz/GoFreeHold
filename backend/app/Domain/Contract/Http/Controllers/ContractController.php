<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Http\Requests\StoreContractRequest;
use App\Domain\Contract\Http\Requests\UpdateContractRequest;
use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Services\ContractVacateService;
use App\Domain\Dashboard\Services\PostMonthlyRentService;
use App\Domain\Property\Models\Unit;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContractController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Contract::with([
            'unit:id,number,property_id',
            'unit.property:id,name',
            'tenant:id,name,email',
            'owner:id,name',
            'caseDocs',
        ]);

        if ($request->boolean('on_case')) {
            $query->where('on_case', true);
        }

        $contracts = $query->latest()->get();

        return response()->json(['status' => 'success', 'data' => ['contracts' => $contracts]]);
    }

    public function store(StoreContractRequest $request, PostMonthlyRentService $rentDueService): JsonResponse
    {
        $validated = $request->validated();

        $files = ['passport_image', 'visa_page', 'tenant_id_image', 'tenant_id_back_image'];
        foreach ($files as $fileKey) {
            if ($request->hasFile($fileKey)) {
                $validated[$fileKey] = $request->file($fileKey)->store('contracts', 'public');
            }
        }

        DB::beginTransaction();
        try {
            $validated['status'] = 'active';
            $contract = Contract::create($validated);

            Unit::where('id', $validated['unit_id'])->update(['status' => 'OCCUPIED']);

            // First-month rent due — same service/idempotency as scheduled monthly job
            $rentDueService->postInitialDueForContract($contract);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Contract created successfully.',
                'data'    => ['contract' => $contract->load(['unit.property', 'tenant', 'owner'])],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['status' => 'error', 'message' => 'Failed to create contract.'], 500);
        }
    }

    public function show(Contract $contract): JsonResponse
    {
        $contract->load(['unit.property', 'tenant', 'owner', 'cheques', 'callLogs.loggedBy', 'caseDocs', 'payments']);

        return response()->json(['status' => 'success', 'data' => ['contract' => $contract]]);
    }

    public function update(UpdateContractRequest $request, Contract $contract): JsonResponse
    {
        $validated = $request->validated();

        $contract->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Contract updated.',
            'data'    => ['contract' => $contract],
        ]);
    }

    public function renew(Request $request, Contract $contract): JsonResponse
    {
        $validated = $request->validate([
            'new_end_date'    => 'required|date|after:' . $contract->end_date,
            'new_rent_amount' => 'nullable|numeric|min:0',
        ]);

        $contract->update([
            'end_date'         => $validated['new_end_date'],
            'rent_amount'      => $validated['new_rent_amount'] ?? $contract->rent_amount,
            'status'           => 'active',
            'last_renewed_at'  => now(),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Contract renewed successfully.',
            'data'    => ['contract' => $contract->fresh(['unit.property', 'tenant', 'owner'])],
        ]);
    }

    public function vacate(Request $request, Contract $contract, ContractVacateService $vacateService): JsonResponse
    {
        $request->validate(['notes' => 'nullable|string']);

        try {
            $vacateService->vacate($contract, $request->notes);

            return response()->json(['status' => 'success', 'message' => 'Contract vacated and unit is now available.']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Failed to vacate contract.'], 500);
        }
    }

    public function settle(Request $request, Contract $contract, ContractVacateService $vacateService): JsonResponse
    {
        // Keep settle semantics (status settled) but reuse unit-release via shared service path:
        // vacate sets vacated; settle historically set settled — preserve settle status then free unit.
        DB::beginTransaction();
        try {
            $contract->update(['status' => 'settled']);
            Unit::where('id', $contract->unit_id)->update(['status' => 'AVAILABLE']);
            DB::commit();

            return response()->json(['status' => 'success', 'message' => 'Contract marked as settled.']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['status' => 'error', 'message' => 'Failed to settle contract.'], 500);
        }
    }

    public function setOnCase(Request $request, Contract $contract): JsonResponse
    {
        $validated = $request->validate([
            'on_case' => 'required|boolean',
        ]);

        $contract->update(['on_case' => $validated['on_case']]);

        return response()->json([
            'status'  => 'success',
            'message' => $validated['on_case'] ? 'Contract marked as on case.' : 'Contract removed from on case.',
            'data'    => ['contract' => $contract->load('caseDocs')],
        ]);
    }

    public function destroy(Contract $contract): JsonResponse
    {
        $contract->delete();

        return response()->json(['status' => 'success', 'message' => 'Contract deleted.']);
    }
}