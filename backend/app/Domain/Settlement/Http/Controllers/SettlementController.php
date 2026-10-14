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

    private function assertSettlementAccess(Request $request, Settlement $settlement): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $resolver = app(\App\Domain\Auth\Services\OwnerContextResolver::class);
            $ownerId = $resolver->ownerId($user);
            $orgId = null;
            try {
                $orgId = $resolver->organizationId($user);
            } catch (\Throwable) {}

            $settlement->loadMissing('contract.unit.property');

            $settlementOwnerId = (int) ($settlement->owner_id ?: $settlement->contract?->owner_id ?: $settlement->contract?->unit?->property?->owner_id);
            $matchesOwner = $settlementOwnerId === (int) $ownerId;
            $settlementOrgId = (int) ($settlement->organization_id ?? $settlement->contract?->organization_id ?? 0);
            $matchesOrg = $orgId && ($settlementOrgId === (int) $orgId);

            abort_unless($matchesOwner || $matchesOrg, 404, 'Settlement not found.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = Settlement::with([
            'owner:id,name,email',
            'contract:id,unit_id,tenant_id,owner_id,status,notes,rent_amount',
            'contract.unit:id,number,property_id,status',
            'contract.unit.property:id,name',
            'contract.tenant:id,name',
            'docs',
            'payments',
        ])->latest();

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $resolver = app(\App\Domain\Auth\Services\OwnerContextResolver::class);
            $ownerId = $resolver->ownerId($user);
            $orgId = null;
            try {
                $orgId = $resolver->organizationId($user);
            } catch (\Throwable) {}

            $query->where(function ($q) use ($ownerId, $orgId) {
                $q->where('owner_id', $ownerId)
                  ->orWhereHas('contract', function ($c) use ($ownerId, $orgId) {
                      $c->where('owner_id', $ownerId);
                      if ($orgId) {
                          $c->orWhere('organization_id', $orgId);
                      }
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('owner_id')) {
            $query->where('owner_id', $request->owner_id);
        }
        if ($request->filled('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }
        if ($request->has('on_case')) {
            $query->where('on_case', $request->boolean('on_case'));
        }
        if ($request->filled('from')) {
            $query->whereDate('vacant_date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('vacant_date', '<=', $request->to);
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

        $contract = \App\Domain\Contract\Models\Contract::with('unit')->findOrFail($validated['contract_id']);

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $resolver = app(\App\Domain\Auth\Services\OwnerContextResolver::class);
            $ownerId = $resolver->ownerId($user);
            $orgId = null;
            try {
                $orgId = $resolver->organizationId($user);
            } catch (\Throwable) {}

            $contractOwnerId = (int) ($contract->owner_id ?: $contract->unit?->property?->owner_id);
            $matchesOwner = $contractOwnerId === (int) $ownerId;
            $matchesOrg = $orgId && ((int) $contract->organization_id === (int) $orgId);

            abort_unless($matchesOwner || $matchesOrg, 404, 'Contract not found.');
        }

        if (empty($validated['owner_id'])) {
            $validated['owner_id'] = $contract->owner_id;
        }

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

    public function show(Request $request, Settlement $settlement): JsonResponse
    {
        $this->assertSettlementAccess($request, $settlement);

        $settlement->load([
            'owner:id,name,email',
            'contract.unit.property',
            'contract.tenant:id,name',
            'docs',
            'payments',
        ]);

        return response()->json(['status' => 'success', 'data' => ['settlement' => $settlement]]);
    }

    public function update(Request $request, Settlement $settlement): JsonResponse
    {
        $this->assertSettlementAccess($request, $settlement);

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

    public function destroy(Request $request, Settlement $settlement): JsonResponse
    {
        $this->assertSettlementAccess($request, $settlement);
        $settlement->delete();

        return response()->json(['status' => 'success', 'message' => 'Settlement record removed.']);
    }

    public function setOnCase(Request $request, Settlement $settlement): JsonResponse
    {
        $this->assertSettlementAccess($request, $settlement);

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
