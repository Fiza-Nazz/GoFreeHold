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

class InventoryController extends Controller
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

    private function assertItemAccess(Request $request, InventoryItem $inventoryItem): void
    {
        $orgId = $this->resolveOrgId($request);
        abort_unless((int) $inventoryItem->organization_id === (int) $orgId, 403, 'Unauthorized access to this inventory item.');
    }

    private function validateUnitInOrg(int $unitId, int $orgId): Unit
    {
        $unit = Unit::where('id', $unitId)->where('organization_id', $orgId)->first();
        if (!$unit) {
            throw ValidationException::withMessages([
                'unit_id' => ['The unit does not belong to this organization.'],
            ]);
        }
        return $unit;
    }

    /**
     * Get warehouse stock (location_type = warehouse)
     */
    public function warehouseItems(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $filters = $request->only(['q', 'category', 'item_kind', 'low_stock']);

        $items = $this->inventoryService->listWarehouse($orgId, $filters);

        return response()->json([
            'status' => 'success',
            'data'   => ['items' => $items],
        ]);
    }

    /**
     * Get unit-assigned inventory items (location_type = unit)
     */
    public function unitItems(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $filters = $request->only(['unit_id', 'q', 'category', 'item_kind']);

        $items = $this->inventoryService->listUnit($orgId, $filters);

        return response()->json([
            'status' => 'success',
            'data'   => ['items' => $items],
        ]);
    }

    /**
     * Unified list with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $filters = $request->only(['location_type', 'unit_id', 'item_kind', 'category', 'q', 'low_stock']);

        $items = $this->inventoryService->listUnified($orgId, $filters);

        return response()->json([
            'status' => 'success',
            'data'   => ['items' => $items],
        ]);
    }

    /**
     * Store new inventory item or asset.
     */
    public function store(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $ownerId = $this->resolveOwnerId($request);

        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'item_kind'       => 'nullable|in:stock,asset',
            'category'        => 'nullable|string|max:100',
            'quantity'        => 'required|numeric|min:0',
            'unit_price'      => 'nullable|numeric|min:0',
            'location_type'   => 'required|in:warehouse,unit',
            'unit_id'         => 'nullable|required_if:location_type,unit|exists:units,id',
            'min_stock_alert' => 'nullable|numeric|min:0',
            'brand'           => 'nullable|string|max:255',
            'model'           => 'nullable|string|max:255',
            'serial_number'   => 'nullable|string|max:255',
            'purchase_date'   => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'condition'       => 'nullable|in:brand_new,good,needs_repair,replaced',
            'notes'           => 'nullable|string',
            'sku'             => 'nullable|string|max:100',
        ]);

        if ($validated['location_type'] === 'unit' && !empty($validated['unit_id'])) {
            $this->validateUnitInOrg((int) $validated['unit_id'], $orgId);
        }

        $item = $this->inventoryService->createItem($orgId, $request->user()->id, $ownerId, $validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Inventory item created successfully.',
            'data'    => ['item' => $item],
        ], 201);
    }

    /**
     * Show single inventory item.
     */
    public function show(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $this->assertItemAccess($request, $inventoryItem);

        return response()->json([
            'status' => 'success',
            'data'   => ['item' => $inventoryItem->load(['unit.property', 'movements'])],
        ]);
    }

    /**
     * Update inventory item.
     */
    public function update(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $this->assertItemAccess($request, $inventoryItem);
        $orgId = $this->resolveOrgId($request);

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'item_kind'       => 'nullable|in:stock,asset',
            'category'        => 'nullable|string|max:100',
            'quantity'        => 'sometimes|numeric|min:0',
            'unit_price'      => 'nullable|numeric|min:0',
            'location_type'   => 'sometimes|in:warehouse,unit',
            'unit_id'         => 'nullable|exists:units,id',
            'min_stock_alert' => 'nullable|numeric|min:0',
            'brand'           => 'nullable|string|max:255',
            'model'           => 'nullable|string|max:255',
            'serial_number'   => 'nullable|string|max:255',
            'purchase_date'   => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'condition'       => 'nullable|in:brand_new,good,needs_repair,replaced',
            'notes'           => 'nullable|string',
            'sku'             => 'nullable|string|max:100',
        ]);

        if (!empty($validated['unit_id'])) {
            $this->validateUnitInOrg((int) $validated['unit_id'], $orgId);
        }

        $updated = $this->inventoryService->updateItem($inventoryItem, $request->user()->id, $validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Inventory item updated successfully.',
            'data'    => ['item' => $updated],
        ]);
    }

    /**
     * Delete (soft-delete) inventory item.
     */
    public function destroy(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $this->assertItemAccess($request, $inventoryItem);

        $inventoryItem->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Inventory item deleted successfully.',
        ]);
    }

    /**
     * Transfer quantity between locations.
     */
    public function transfer(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $this->assertItemAccess($request, $inventoryItem);
        $orgId = $this->resolveOrgId($request);

        $validated = $request->validate([
            'quantity'         => 'required|numeric|min:0.01',
            'to_location_type' => 'required|in:warehouse,unit',
            'to_unit_id'       => 'nullable|required_if:to_location_type,unit|exists:units,id',
        ]);

        if ($validated['to_location_type'] === 'unit' && !empty($validated['to_unit_id'])) {
            $this->validateUnitInOrg((int) $validated['to_unit_id'], $orgId);
        }

        $result = $this->inventoryService->transfer(
            $inventoryItem,
            $orgId,
            $request->user()->id,
            (float) $validated['quantity'],
            $validated['to_location_type'],
            $validated['to_unit_id'] ?? null
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Transfer completed successfully.',
            'data'    => $result,
        ]);
    }

    /**
     * Summary report for inventory.
     */
    public function summary(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $summary = $this->inventoryService->summary($orgId);

        return response()->json([
            'status' => 'success',
            'data'   => $summary,
        ]);
    }

    /**
     * Inventory addendum for contract.
     */
    public function addendum(Request $request, int $unit): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $addendum = $this->inventoryService->unitAddendum($orgId, $unit);

        return response()->json([
            'status' => 'success',
            'data'   => $addendum,
        ]);
    }
}
