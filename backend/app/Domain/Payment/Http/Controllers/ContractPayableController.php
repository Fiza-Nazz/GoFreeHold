<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Payment\Models\ContractPayable;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractPayableController extends Controller
{
    private function assertContractAccess(Request $request, int $contractId): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $contract = \App\Domain\Contract\Models\Contract::with('unit.property')->find($contractId);
            abort_unless($contract, 404, 'Contract not found.');
            $contractOwnerId = (int) ($contract->owner_id ?: $contract->unit?->property?->owner_id);
            abort_unless($contractOwnerId === (int) $ownerId, 403, 'Unauthorized access to this contract.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = ContractPayable::with('contract:id,unit_id,tenant_id');

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->whereHas('contract', function ($c) use ($ownerId) {
                $c->where('contracts.owner_id', $ownerId)
                  ->orWhereHas('unit.property', fn ($p) => $p->where('owner_id', $ownerId));
            });
        }

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

        $this->assertContractAccess($request, (int) $validated['contract_id']);
        $payable = ContractPayable::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Payable created.', 'data' => ['payable' => $payable]], 201);
    }

    public function show(Request $request, ContractPayable $contractPayable): JsonResponse
    {
        $this->assertContractAccess($request, (int) $contractPayable->contract_id);
        return response()->json(['status' => 'success', 'data' => ['payable' => $contractPayable->load('contract')]]);
    }

    public function update(Request $request, ContractPayable $contractPayable): JsonResponse
    {
        $this->assertContractAccess($request, (int) $contractPayable->contract_id);
        $validated = $request->validate([
            'description' => 'nullable|string|max:500',
            'amount'      => 'numeric|min:0',
            'due_date'    => 'nullable|date',
            'status'      => 'in:pending,paid',
        ]);

        $contractPayable->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Payable updated.', 'data' => ['payable' => $contractPayable]]);
    }

    public function destroy(Request $request, ContractPayable $contractPayable): JsonResponse
    {
        $this->assertContractAccess($request, (int) $contractPayable->contract_id);
        $contractPayable->delete();

        return response()->json(['status' => 'success', 'message' => 'Payable deleted.']);
    }
}