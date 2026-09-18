<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Contract\Http\Requests\StoreContractRequest;
use App\Domain\Contract\Http\Requests\UpdateContractRequest;
use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Services\ContractService;
use App\Domain\Contract\Services\ContractVacateService;
use App\Domain\Dashboard\Services\PostMonthlyRentService;
use App\Domain\Property\Models\Unit;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContractController extends Controller
{
    private function assertContractAccess(Request $request, Contract $contract): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(OwnerContextResolver::class)->ownerId($user);
            $contractOwnerId = (int) ($contract->owner_id ?: $contract->unit?->property?->owner_id);
            abort_unless($contractOwnerId === (int) $ownerId, 403, 'Unauthorized access to this contract.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = Contract::with([
            'unit:id,number,property_id',
            'unit.property:id,name',
            'tenant:id,name,email',
            'owner:id,name',
            'caseDocs',
        ]);

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(OwnerContextResolver::class)->ownerId($user);
            $query->where(function ($q) use ($ownerId) {
                $q->where('contracts.owner_id', $ownerId)
                  ->orWhereHas('unit.property', fn ($p) => $p->where('owner_id', $ownerId));
            });
        }

        if ($request->boolean('on_case')) {
            $query->where('on_case', true);
        }

        $contracts = $query->latest()->get();

        return response()->json(['status' => 'success', 'data' => ['contracts' => $contracts]]);
    }

    public function store(StoreContractRequest $request, ContractService $contractService): JsonResponse
    {
        $validated = $request->validated();

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(OwnerContextResolver::class)->ownerId($user);
            $validated['owner_id'] = $ownerId;
            $unit = Unit::with('property')->findOrFail($validated['unit_id']);
            $unitOwnerId = (int) ($unit->owner_id ?: $unit->property?->owner_id);
            abort_unless($unitOwnerId === (int) $ownerId, 403, 'Unit does not belong to your account.');
        }

        $files = ['passport_image', 'visa_page', 'tenant_id_image', 'tenant_id_back_image'];
        foreach ($files as $fileKey) {
            if ($request->hasFile($fileKey)) {
                $validated[$fileKey] = $request->file($fileKey)->store('contracts', 'public');
            }
        }

        try {
            $contract = $contractService->createContract($validated);

            return response()->json([
                'status'  => 'success',
                'message' => 'Contract created successfully.',
                'data'    => ['contract' => $contract->load(['unit.property', 'tenant', 'owner'])],
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Failed to create contract.'], 500);
        }
    }

    public function show(Request $request, Contract $contract): JsonResponse
    {
        $this->assertContractAccess($request, $contract);
        $contract->load(['unit.property', 'tenant', 'owner', 'cheques', 'callLogs.loggedBy', 'caseDocs', 'payments']);

        return response()->json(['status' => 'success', 'data' => ['contract' => $contract]]);
    }

    public function update(UpdateContractRequest $request, Contract $contract): JsonResponse
    {
        $this->assertContractAccess($request, $contract);
        $validated = $request->validated();

        $tenantName = $validated['tenant_name'] ?? null;
        $tenantEmail = $validated['tenant_email'] ?? null;
        $tenantAddress = $validated['tenant_address'] ?? null;
        $tenantContact = $validated['tenant_contact'] ?? null;

        unset($validated['tenant_name'], $validated['tenant_email'], $validated['tenant_address'], $validated['tenant_contact']);

        $contract->update($validated);

        if ($contract->tenant_id) {
            $tenant = \App\Domain\Auth\Models\Tenant::find($contract->tenant_id);
            if ($tenant) {
                $tenantUpdates = [];
                if ($tenantName !== null) $tenantUpdates['name'] = $tenantName;
                if ($tenantEmail !== null) $tenantUpdates['email'] = $tenantEmail;
                if ($tenantAddress !== null) $tenantUpdates['address'] = $tenantAddress;
                if ($tenantContact !== null) {
                    $tenantUpdates['contact'] = $tenantContact;
                    $tenantUpdates['phone'] = $tenantContact;
                }
                if (!empty($tenantUpdates)) {
                    $tenant->update($tenantUpdates);

                    if ($tenant->user_id) {
                        $userUpdates = [];
                        if (isset($tenantUpdates['name'])) $userUpdates['name'] = $tenantUpdates['name'];
                        if (isset($tenantUpdates['email'])) $userUpdates['email'] = $tenantUpdates['email'];
                        if (!empty($userUpdates)) {
                            \App\Domain\Auth\Models\User::where('id', $tenant->user_id)->update($userUpdates);
                        }
                    }
                }
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Contract updated.',
            'data'    => ['contract' => $contract->fresh(['unit.property', 'tenant', 'owner'])],
        ]);
    }

    public function renew(Request $request, Contract $contract): JsonResponse
    {
        $this->assertContractAccess($request, $contract);
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
        $this->assertContractAccess($request, $contract);
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
        $this->assertContractAccess($request, $contract);
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
        $this->assertContractAccess($request, $contract);
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

    public function destroy(Request $request, Contract $contract): JsonResponse
    {
        $this->assertContractAccess($request, $contract);
        $contract->delete();

        return response()->json(['status' => 'success', 'message' => 'Contract deleted.']);
    }
}