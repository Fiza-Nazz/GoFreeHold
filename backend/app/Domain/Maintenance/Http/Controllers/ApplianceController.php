<?php

namespace App\Domain\Maintenance\Http\Controllers;

use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Maintenance\Models\InventoryItem;
use App\Domain\Maintenance\Services\InventoryService;
use App\Domain\Property\Models\Unit;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Compatibility alias controller mapping /owner/appliances to unified inventory_items (item_kind = asset).
 * Per Paul Brit's Inventory API Guide (Section 4.7).
 */
class ApplianceController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventoryService,
        private readonly OwnerContextResolver $ownerResolver
    ) {
    }

    private function resolveOrgId(Request $request): int
    {
        return $this->ownerResolver->organizationId($request->user());
    }

    private function resolveOwnerId(Request $request): ?int
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            try {
                return $this->ownerResolver->ownerId($user);
            } catch (\Throwable $e) {
                return null;
            }
        }
        return null;
    }

    public function index(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $query = InventoryItem::where('organization_id', $orgId)
            ->where('item_kind', 'asset')
            ->where('location_type', 'unit')
            ->with(['unit:id,number,property_id', 'unit.property:id,name']);

        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        if ($request->filled('q')) {
            $q = '%' . $request->q . '%';
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', $q)
                    ->orWhere('brand', 'like', $q)
                    ->orWhere('model', 'like', $q)
                    ->orWhere('serial_number', 'like', $q);
            });
        }

        $items = $query->latest('id')->get();

        return response()->json([
            'status' => 'success',
            'data'   => ['appliances' => $items],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $ownerId = $this->resolveOwnerId($request);

        $validated = $request->validate([
            'unit_id'         => 'required|exists:units,id',
            'name'            => 'required|string|max:255',
            'brand'           => 'required|string|max:255',
            'model'           => 'nullable|string|max:255',
            'model_number'    => 'nullable|string|max:255',
            'serial_number'   => 'nullable|string|max:255',
            'purchase_date'   => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'condition'       => 'nullable|in:brand_new,good,needs_repair,replaced',
            'notes'           => 'nullable|string',
        ]);

        $unit = Unit::where('id', $validated['unit_id'])->where('organization_id', $orgId)->first();
        if (!$unit) {
            throw ValidationException::withMessages([
                'unit_id' => ['The unit does not belong to this organization.'],
            ]);
        }

        $itemData = [
            'name'            => $validated['name'],
            'item_kind'       => 'asset',
            'location_type'   => 'unit',
            'unit_id'         => $validated['unit_id'],
            'category'        => 'Appliances',
            'quantity'        => 1.00,
            'unit_price'      => 0.00,
            'unit_cost'       => 0.00,
            'brand'           => $validated['brand'],
            'model'           => $validated['model'] ?? $validated['model_number'] ?? null,
            'serial_number'   => $validated['serial_number'] ?? null,
            'purchase_date'   => $validated['purchase_date'] ?? null,
            'warranty_expiry' => $validated['warranty_expiry'] ?? null,
            'condition'       => $validated['condition'] ?? 'good',
            'notes'           => $validated['notes'] ?? null,
        ];

        $item = $this->inventoryService->createItem($orgId, $request->user()->id, $ownerId, $itemData);

        return response()->json([
            'status'  => 'success',
            'message' => 'Appliance added to catalog.',
            'data'    => ['appliance' => $item->load(['unit.property'])],
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $item = InventoryItem::where('organization_id', $orgId)
            ->where('item_kind', 'asset')
            ->with(['unit.property'])
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => ['appliance' => $item],
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $item = InventoryItem::where('organization_id', $orgId)
            ->where('item_kind', 'asset')
            ->findOrFail($id);

        $validated = $request->validate([
            'unit_id'         => 'sometimes|required|exists:units,id',
            'name'            => 'sometimes|string|max:255',
            'brand'           => 'sometimes|string|max:255',
            'model'           => 'nullable|string|max:255',
            'model_number'    => 'nullable|string|max:255',
            'serial_number'   => 'nullable|string|max:255',
            'purchase_date'   => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'condition'       => 'nullable|in:brand_new,good,needs_repair,replaced',
            'notes'           => 'nullable|string',
        ]);

        if (!empty($validated['unit_id'])) {
            $unit = Unit::where('id', $validated['unit_id'])->where('organization_id', $orgId)->first();
            if (!$unit) {
                throw ValidationException::withMessages([
                    'unit_id' => ['The unit does not belong to this organization.'],
                ]);
            }
        }

        $payload = $validated;
        if (array_key_exists('model_number', $payload)) {
            if (!array_key_exists('model', $payload)) {
                $payload['model'] = $payload['model_number'];
            }
            unset($payload['model_number']);
        }

        $updated = $this->inventoryService->updateItem($item, $request->user()->id, $payload);

        return response()->json([
            'status'  => 'success',
            'message' => 'Appliance updated.',
            'data'    => ['appliance' => $updated],
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $item = InventoryItem::where('organization_id', $orgId)
            ->where('item_kind', 'asset')
            ->findOrFail($id);

        $item->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Appliance removed.',
        ]);
    }
}
