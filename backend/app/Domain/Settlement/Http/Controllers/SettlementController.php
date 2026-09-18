<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\Settlement;
use App\Domain\Settlement\Services\SettlementService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettlementController extends Controller
{
    public function __construct(private readonly SettlementService $settlementService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Settlement::with([
            'owner:id,name,email',
            'contract:id,unit_id,tenant_id,owner_id,status,rent_amount',
            'contract.unit:id,number,property_id,status',
            'contract.unit.property:id,name',
            'contract.tenant:id,name',
            'docs',
            'payments',
        ])->latest();

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->where(function ($q) use ($ownerId) {
                $q->where('owner_id', $ownerId)
                  ->orWhereHas('contract', fn ($c) => $c->where('owner_id', $ownerId));
            });
        }

        return response()->json(['status' => 'success', 'data' => ['settlements' => $query->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'owner_id'    => 'nullable|exists:owners,id',
            'vacant_date' => 'required|date',
            'dues'        => 'required|numeric|min:0',
            'receivable'  => 'required|numeric|min:0',
            'on_case'     => 'nullable|boolean',
            'status'      => 'nullable|in:pending,completed',
        ]);

        $settlement = $this->settlementService->createSettlement($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Settlement created.',
            'data'    => [
                'settlement' => $settlement->load([
                    'owner:id,name,email',
                    'contract.unit.property',
                    'contract.tenant:id,name',
                    'docs',
                    'payments',
                ]),
            ],
        ], 201);
    }

    public function show(Settlement $settlement): JsonResponse
    {
        $settlement->load([
            'owner',
            'contract.unit.property',
            'contract.tenant',
            'docs',
            'payments',
        ]);

        return response()->json(['status' => 'success', 'data' => ['settlement' => $settlement]]);
    }

    public function update(Request $request, Settlement $settlement): JsonResponse
    {
        $validated = $request->validate([
            'vacant_date' => 'sometimes|date',
            'dues'        => 'sometimes|numeric|min:0',
            'receivable'  => 'sometimes|numeric|min:0',
            'on_case'     => 'sometimes|boolean',
            'status'      => 'sometimes|in:pending,completed',
            'contract_id' => 'sometimes|nullable|exists:contracts,id',
        ]);

        $settlement = $this->settlementService->updateSettlement($settlement, $validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Settlement updated.',
            'data'    => [
                'settlement' => $settlement->fresh([
                    'owner:id,name,email',
                    'contract.unit.property',
                    'contract.tenant:id,name',
                    'docs',
                    'payments',
                ]),
            ],
        ]);
    }

    public function destroy(Settlement $settlement): JsonResponse
    {
        $settlement->delete();

        return response()->json(['status' => 'success', 'message' => 'Settlement record removed.']);
    }

    public function setOnCase(Request $request, Settlement $settlement): JsonResponse
    {
        $validated = $request->validate([
            'on_case' => 'required|boolean',
        ]);

        $settlement->update(['on_case' => $validated['on_case']]);

        return response()->json([
            'status'  => 'success',
            'message' => $validated['on_case'] ? 'Settlement marked as on case.' : 'Settlement removed from on case.',
            'data'    => ['settlement' => $settlement],
        ]);
    }
}
