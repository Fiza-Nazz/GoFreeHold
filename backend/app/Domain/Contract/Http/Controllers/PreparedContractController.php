<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Contract\Http\Requests\StorePreparedContractRequest;
use App\Domain\Contract\Models\PreparedContract;
use App\Domain\Contract\Services\ContractService;
use App\Domain\Property\Models\Unit;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PreparedContractController extends Controller
{
    /**
     * Authorize access for owner / cashier / accountant users.
     */
    private function assertPreparedContractAccess(Request $request, PreparedContract $preparedContract): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(OwnerContextResolver::class)->ownerId($user);
            $contractOwnerId = (int) ($preparedContract->owner_id ?: ($preparedContract->unit?->owner_id ?: $preparedContract->unit?->property?->owner_id));
            abort_unless($contractOwnerId === (int) $ownerId, 403, 'Unauthorized access to this prepared contract.');
        }
    }

    /**
     * GET /admin/prepared-contracts
     * GET /owner/prepared-contracts
     *
     * List prepared (draft) tenancy contracts.
     * Does NOT touch active contracts table or occupy units.
     */
    public function index(Request $request): JsonResponse
    {
        $query = PreparedContract::with(['unit', 'tenant', 'owner']);

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(OwnerContextResolver::class)->ownerId($user);
            $query->where(function ($q) use ($ownerId) {
                $q->where('prepared_contracts.owner_id', $ownerId)
                  ->orWhereHas('unit', fn ($u) => $u->where('owner_id', $ownerId))
                  ->orWhereHas('unit.property', fn ($p) => $p->where('owner_id', $ownerId));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        $preparedContracts = $query->latest()->get();

        return response()->json([
            'data' => [
                'prepared_contracts' => $preparedContracts,
            ],
        ]);
    }

    /**
     * POST /admin/prepared-contracts
     * POST /owner/prepared-contracts
     *
     * Create a prepared (draft) tenancy contract via multipart/form-data.
     * Strictly isolated from active contracts, unit status, rent ledger, and PDC cheques.
     */
    public function store(StorePreparedContractRequest $request, ContractService $contractService): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        // 1. Resolve & authorize owner
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(OwnerContextResolver::class)->ownerId($user);
            $validated['owner_id'] = $ownerId;

            if (!empty($validated['unit_id'])) {
                $unit = Unit::with('property')->findOrFail($validated['unit_id']);
                $unitOwnerId = (int) ($unit->owner_id ?: $unit->property?->owner_id);
                abort_unless($unitOwnerId === (int) $ownerId, 403, 'Unit does not belong to your account.');
            }
        } elseif (empty($validated['owner_id']) && !empty($validated['unit_id'])) {
            $unit = Unit::with('property')->find($validated['unit_id']);
            if ($unit) {
                $validated['owner_id'] = $unit->owner_id ?: $unit->property?->owner_id;
            }
        }

        // 2. Resolve or auto-create Tenant when new tenant details are provided
        $tenantName = $validated['tenant_name'] ?? ($validated['new_tenant_details']['name'] ?? null);
        $tenantEmail = $validated['tenant_email'] ?? ($validated['new_tenant_details']['email'] ?? null);
        $tenantPhone = $validated['tenant_phone'] ?? ($validated['new_tenant_details']['phone'] ?? null);
        $tenantEmiratesId = $validated['tenant_emirates_id'] ?? ($validated['new_tenant_details']['emirates_id'] ?? null);
        $tenantNationality = $validated['tenant_nationality'] ?? ($validated['new_tenant_details']['nationality'] ?? null);
        $tenantPassport = $validated['tenant_passport_number'] ?? ($validated['new_tenant_details']['passport_number'] ?? null);
        $tenantAddress = $validated['tenant_address'] ?? ($validated['new_tenant_details']['address'] ?? null);

        if (empty($validated['tenant_id']) && ($tenantName || $tenantEmail || $tenantPhone)) {
            try {
                $resolvedTenantId = $contractService->resolveTenantId([
                    'owner_id'               => $validated['owner_id'] ?? null,
                    'tenant_id'              => null,
                    'tenant_name'            => $tenantName,
                    'tenant_email'           => $tenantEmail,
                    'tenant_phone'           => $tenantPhone,
                    'tenant_emirates_id'     => $tenantEmiratesId,
                    'tenant_nationality'     => $tenantNationality,
                    'tenant_passport_number' => $tenantPassport,
                    'tenant_address'         => $tenantAddress,
                ]);
                $validated['tenant_id'] = $resolvedTenantId;
            } catch (\Throwable $e) {
                // If auto-create fails, keep tenant_id as null
            }
        }

        // Record structured new tenant details if provided
        if ($tenantName || $tenantEmail || $tenantPhone || $tenantEmiratesId) {
            $validated['new_tenant_details'] = array_merge($validated['new_tenant_details'] ?? [], array_filter([
                'name'            => $tenantName,
                'email'           => $tenantEmail,
                'phone'           => $tenantPhone,
                'emirates_id'     => $tenantEmiratesId,
                'nationality'     => $tenantNationality,
                'passport_number' => $tenantPassport,
                'address'         => $tenantAddress,
            ]));
        }

        // 3. Handle document & image uploads
        $imageFiles = ['passport_image', 'visa_page', 'tenant_id_image', 'tenant_id_back_image'];
        foreach ($imageFiles as $fileKey) {
            if ($request->hasFile($fileKey)) {
                $validated[$fileKey] = $request->file($fileKey)->store('prepared_contracts', 'public');
            }
        }

        if ($request->hasFile('tenant_documents')) {
            $docs = [];
            $uploaded = is_array($request->file('tenant_documents'))
                ? $request->file('tenant_documents')
                : [$request->file('tenant_documents')];
            foreach ($uploaded as $doc) {
                $docs[] = [
                    'name' => $doc->getClientOriginalName(),
                    'path' => $doc->store('prepared_contracts/docs', 'public'),
                    'size' => $doc->getSize(),
                    'mime' => $doc->getClientMimeType(),
                ];
            }
            $validated['tenant_documents'] = $docs;
        }

        // Clean up transient fields not matching DB columns
        unset(
            $validated['tenant_name'],
            $validated['tenant_email'],
            $validated['tenant_phone'],
            $validated['tenant_emirates_id'],
            $validated['tenant_nationality'],
            $validated['tenant_passport_number'],
            $validated['tenant_address']
        );

        $validated['status'] = $validated['status'] ?? 'draft';

        // 4. Save preparation — NO side-effects on contracts, units status, rent ledger, or pdc cheques
        $preparedContract = PreparedContract::create($validated);
        $preparedContract->load(['unit', 'tenant', 'owner']);

        return response()->json([
            'data' => [
                'prepared_contract' => $preparedContract,
            ],
        ], 201);
    }

    /**
     * GET /admin/prepared-contracts/{preparedContract}
     * GET /owner/prepared-contracts/{preparedContract}
     */
    public function show(Request $request, PreparedContract $preparedContract): JsonResponse
    {
        $this->assertPreparedContractAccess($request, $preparedContract);
        $preparedContract->load(['unit', 'tenant', 'owner']);

        return response()->json([
            'data' => [
                'prepared_contract' => $preparedContract,
            ],
        ]);
    }

    /**
     * PUT/PATCH /admin/prepared-contracts/{preparedContract}
     * PUT/PATCH /owner/prepared-contracts/{preparedContract}
     */
    public function update(Request $request, PreparedContract $preparedContract): JsonResponse
    {
        $this->assertPreparedContractAccess($request, $preparedContract);

        $validated = $request->validate([
            'start_date'        => 'nullable|date',
            'end_date'          => 'nullable|date',
            'rent_amount'       => 'nullable|numeric|min:0',
            'contract_value'    => 'nullable|numeric|min:0',
            'security_deposit'  => 'nullable|numeric|min:0',
            'lease_term'        => 'nullable|string|max:100',
            'payment_frequency' => 'nullable|string|max:100',
            'mode_of_payment'   => 'nullable|string|max:100',
            'number_of_cheques' => 'nullable|integer|min:0|max:100',
            'notes'             => 'nullable|string',
            'status'            => 'nullable|string|max:50',
            'addendum_terms'    => 'nullable',
            'pdc_cheques'       => 'nullable',
        ]);

        if (isset($validated['addendum_terms']) && is_string($validated['addendum_terms'])) {
            $validated['addendum_terms'] = json_decode($validated['addendum_terms'], true);
        }
        if (isset($validated['pdc_cheques']) && is_string($validated['pdc_cheques'])) {
            $validated['pdc_cheques'] = json_decode($validated['pdc_cheques'], true);
        }

        $preparedContract->update($validated);
        $preparedContract->load(['unit', 'tenant', 'owner']);

        return response()->json([
            'data' => [
                'prepared_contract' => $preparedContract,
            ],
        ]);
    }

    /**
     * DELETE /admin/prepared-contracts/{preparedContract}
     * DELETE /owner/prepared-contracts/{preparedContract}
     */
    public function destroy(Request $request, PreparedContract $preparedContract): JsonResponse
    {
        $this->assertPreparedContractAccess($request, $preparedContract);
        $preparedContract->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Prepared contract deleted successfully.',
        ]);
    }
}
