<?php

namespace App\Domain\Maintenance\Services;

use App\Domain\Maintenance\Models\InventoryItem;
use App\Domain\Maintenance\Models\InventoryMovement;
use App\Domain\Maintenance\Models\Purchase;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryService
{
    /**
     * Get base query for inventory items scoped to an organization.
     */
    public function queryForOrg(int $orgId): Builder
    {
        return InventoryItem::where('organization_id', $orgId);
    }

    /**
     * List warehouse stock.
     */
    public function listWarehouse(int $orgId, array $filters = []): array
    {
        $query = $this->queryForOrg($orgId)
            ->warehouse();

        if (!empty($filters['q'])) {
            $q = '%' . $filters['q'] . '%';
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', $q)
                    ->orWhere('brand', 'like', $q)
                    ->orWhere('model', 'like', $q)
                    ->orWhere('serial_number', 'like', $q)
                    ->orWhere('sku', 'like', $q);
            });
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['item_kind'])) {
            $query->where('item_kind', $filters['item_kind']);
        }

        if (!empty($filters['low_stock'])) {
            $query->whereNotNull('min_stock_alert')
                ->whereColumn('quantity', '<=', 'min_stock_alert');
        }

        $items = $query->latest('id')->get();

        return $items->toArray();
    }

    /**
     * List unit-assigned stock and assets.
     */
    public function listUnit(int $orgId, array $filters = []): array
    {
        $query = $this->queryForOrg($orgId)
            ->unit()
            ->with(['unit:id,number,property_id', 'unit.property:id,name']);

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (!empty($filters['item_kind'])) {
            $query->where('item_kind', $filters['item_kind']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['q'])) {
            $q = '%' . $filters['q'] . '%';
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', $q)
                    ->orWhere('brand', 'like', $q)
                    ->orWhere('model', 'like', $q)
                    ->orWhere('serial_number', 'like', $q)
                    ->orWhere('category', 'like', $q);
            });
        }

        $items = $query->latest('id')->get();

        return $items->toArray();
    }

    /**
     * List all inventory items with optional filters.
     */
    public function listUnified(int $orgId, array $filters = []): array
    {
        $query = $this->queryForOrg($orgId)
            ->with(['unit:id,number,property_id', 'unit.property:id,name']);

        if (!empty($filters['location_type'])) {
            $query->where('location_type', $filters['location_type']);
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (!empty($filters['item_kind'])) {
            $query->where('item_kind', $filters['item_kind']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['low_stock'])) {
            $query->warehouse()
                ->whereNotNull('min_stock_alert')
                ->whereColumn('quantity', '<=', 'min_stock_alert');
        }

        if (!empty($filters['q'])) {
            $q = '%' . $filters['q'] . '%';
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', $q)
                    ->orWhere('brand', 'like', $q)
                    ->orWhere('model', 'like', $q)
                    ->orWhere('serial_number', 'like', $q);
            });
        }

        return $query->latest('id')->get()->toArray();
    }

    /**
     * Create an inventory item and write movement ledger.
     */
    public function createItem(int $orgId, ?int $actorUserId, ?int $ownerId, array $data): InventoryItem
    {
        return DB::transaction(function () use ($orgId, $actorUserId, $ownerId, $data) {
            $data['organization_id'] = $orgId;
            $data['owner_id'] = $ownerId;
            $data['item_kind'] = $data['item_kind'] ?? 'stock';
            $data['unit_cost'] = $data['unit_cost'] ?? ($data['unit_price'] ?? 0.00);
            $data['location_id'] = $data['location_type'] === 'unit' ? (int) ($data['unit_id'] ?? 0) : 0;

            if ($data['location_type'] === 'warehouse') {
                $data['unit_id'] = null;
            }

            $item = InventoryItem::create($data);

            if ((float) $item->quantity > 0) {
                InventoryMovement::create([
                    'organization_id'   => $orgId,
                    'inventory_item_id' => $item->id,
                    'type'              => 'adjustment',
                    'quantity_delta'    => $item->quantity,
                    'quantity_after'    => $item->quantity,
                    'reference_type'    => 'manual_create',
                    'reference_id'      => null,
                    'actor_user_id'     => $actorUserId,
                    'meta'              => [
                        'action'        => 'created',
                        'location_type' => $item->location_type,
                        'unit_id'       => $item->unit_id,
                    ],
                    'created_at'        => now(),
                ]);
            }

            return $item->load(['unit.property']);
        });
    }

    /**
     * Update an inventory item and write movement ledger if quantity changed.
     */
    public function updateItem(InventoryItem $item, ?int $actorUserId, array $data): InventoryItem
    {
        return DB::transaction(function () use ($item, $actorUserId, $data) {
            $oldQuantity = (float) $item->quantity;

            if (array_key_exists('unit_price', $data) && !array_key_exists('unit_cost', $data)) {
                $data['unit_cost'] = $data['unit_price'];
            }

            if (array_key_exists('location_type', $data) && $data['location_type'] === 'warehouse') {
                $data['unit_id'] = null;
                $data['location_id'] = 0;
            } elseif (array_key_exists('unit_id', $data) && $data['unit_id']) {
                $data['location_id'] = (int) $data['unit_id'];
            }

            $item->update($data);
            $newQuantity = (float) $item->quantity;

            if ($newQuantity !== $oldQuantity) {
                InventoryMovement::create([
                    'organization_id'   => $item->organization_id,
                    'inventory_item_id' => $item->id,
                    'type'              => 'adjustment',
                    'quantity_delta'    => $newQuantity - $oldQuantity,
                    'quantity_after'    => $newQuantity,
                    'reference_type'    => 'manual_update',
                    'reference_id'      => null,
                    'actor_user_id'     => $actorUserId,
                    'meta'              => [
                        'action' => 'updated_quantity',
                        'from'   => $oldQuantity,
                        'to'     => $newQuantity,
                    ],
                    'created_at'        => now(),
                ]);
            }

            return $item->load(['unit.property']);
        });
    }

    /**
     * Transfer quantity between locations.
     */
    public function transfer(InventoryItem $source, int $orgId, ?int $actorUserId, float $qty, string $toLocationType, ?int $toUnitId = null): array
    {
        return DB::transaction(function () use ($source, $orgId, $actorUserId, $qty, $toLocationType, $toUnitId) {
            $sourceQty = (float) $source->quantity;
            if ($sourceQty < $qty) {
                throw ValidationException::withMessages([
                    'quantity' => ['Insufficient quantity available for transfer. Current quantity: ' . $sourceQty],
                ]);
            }

            if ($toLocationType === 'unit' && !$toUnitId) {
                throw ValidationException::withMessages([
                    'to_unit_id' => ['Target unit is required when transferring to a unit.'],
                ]);
            }

            if ($toLocationType === 'warehouse') {
                $toUnitId = null;
            }

            // Same location transfer check
            if ($source->location_type === $toLocationType && (int) $source->unit_id === (int) $toUnitId) {
                throw ValidationException::withMessages([
                    'to_unit_id' => ['Source and target locations cannot be identical.'],
                ]);
            }

            $movementTypeOut = $toLocationType === 'unit' ? 'assign_to_unit' : 'transfer_out';
            $movementTypeIn = $toLocationType === 'warehouse' ? 'return_to_warehouse' : 'transfer_in';

            // Case A: Full transfer of a serialized asset
            if ($source->item_kind === 'asset' && $sourceQty == $qty) {
                $source->update([
                    'location_type' => $toLocationType,
                    'unit_id'       => $toUnitId,
                    'location_id'   => $toUnitId ?: 0,
                ]);

                InventoryMovement::create([
                    'organization_id'   => $orgId,
                    'inventory_item_id' => $source->id,
                    'type'              => $movementTypeOut,
                    'quantity_delta'    => 0,
                    'quantity_after'    => $source->quantity,
                    'reference_type'    => 'transfer',
                    'reference_id'      => $source->id,
                    'actor_user_id'     => $actorUserId,
                    'meta'              => [
                        'from_location' => $source->location_type,
                        'to_location'   => $toLocationType,
                        'to_unit_id'    => $toUnitId,
                    ],
                    'created_at'        => now(),
                ]);

                return [
                    'source'      => $source->load(['unit.property']),
                    'destination' => $source,
                ];
            }

            // Case B: Partial transfer or stock transfer
            // 1. Decrement source
            $source->quantity = $sourceQty - $qty;
            $source->save();

            InventoryMovement::create([
                'organization_id'   => $orgId,
                'inventory_item_id' => $source->id,
                'type'              => $movementTypeOut,
                'quantity_delta'    => -$qty,
                'quantity_after'    => $source->quantity,
                'reference_type'    => 'transfer_out',
                'reference_id'      => null,
                'actor_user_id'     => $actorUserId,
                'meta'              => [
                    'to_location_type' => $toLocationType,
                    'to_unit_id'       => $toUnitId,
                ],
                'created_at'        => now(),
            ]);

            // 2. Find or create destination item in same org
            $destItem = null;
            if ($source->item_kind === 'stock') {
                $destItem = InventoryItem::where('organization_id', $orgId)
                    ->where('location_type', $toLocationType)
                    ->where('unit_id', $toUnitId)
                    ->where('name', $source->name)
                    ->where('item_kind', 'stock')
                    ->first();
            }

            if ($destItem) {
                $destItem->quantity = (float) $destItem->quantity + $qty;
                $destItem->save();
            } else {
                $destItem = InventoryItem::create([
                    'organization_id' => $orgId,
                    'owner_id'        => $source->owner_id,
                    'item_kind'       => $source->item_kind,
                    'location_type'   => $toLocationType,
                    'location_id'     => $toUnitId ?: 0,
                    'unit_id'         => $toUnitId,
                    'name'            => $source->name,
                    'category'        => $source->category,
                    'quantity'        => $qty,
                    'unit_price'      => $source->unit_price,
                    'unit_cost'       => $source->unit_cost,
                    'min_stock_alert' => $toLocationType === 'warehouse' ? $source->min_stock_alert : null,
                    'brand'           => $source->brand,
                    'model'           => $source->model,
                    'serial_number'   => $source->serial_number,
                    'purchase_date'   => $source->purchase_date,
                    'warranty_expiry' => $source->warranty_expiry,
                    'condition'       => $source->condition,
                    'notes'           => $source->notes,
                    'sku'             => $source->sku,
                ]);
            }

            InventoryMovement::create([
                'organization_id'   => $orgId,
                'inventory_item_id' => $destItem->id,
                'type'              => $movementTypeIn,
                'quantity_delta'    => $qty,
                'quantity_after'    => $destItem->quantity,
                'reference_type'    => 'transfer_in',
                'reference_id'      => $source->id,
                'actor_user_id'     => $actorUserId,
                'meta'              => [
                    'from_item_id'       => $source->id,
                    'from_location_type' => $source->location_type,
                    'from_unit_id'       => $source->unit_id,
                ],
                'created_at'        => now(),
            ]);

            return [
                'source'      => $source->load(['unit.property']),
                'destination' => $destItem->load(['unit.property']),
            ];
        });
    }

    /**
     * Process receiving a purchase order.
     * Upserts items into warehouse stock idempotently and writes movements.
     */
    public function receivePurchase(Purchase $purchase, ?int $actorUserId): Purchase
    {
        return DB::transaction(function () use ($purchase, $actorUserId) {
            $orgId = $purchase->organization_id;

            // Check if already received
            $alreadyReceived = InventoryMovement::where('reference_type', 'purchase')
                ->where('reference_id', $purchase->id)
                ->where('type', 'purchase_receive')
                ->exists();

            if ($alreadyReceived) {
                return $purchase;
            }

            foreach ($purchase->items as $item) {
                $qty = (float) $item->qty;
                $price = (float) $item->price;
                $kind = $item->item_kind ?: 'stock';

                // Look for existing warehouse item
                $invItem = null;
                if ($item->inventory_item_id) {
                    $invItem = InventoryItem::where('organization_id', $orgId)->find($item->inventory_item_id);
                }

                if (!$invItem && $kind === 'stock') {
                    $invItem = InventoryItem::where('organization_id', $orgId)
                        ->warehouse()
                        ->where('name', $item->item_name)
                        ->where('item_kind', 'stock')
                        ->first();
                }

                if ($invItem) {
                    $invItem->quantity = (float) $invItem->quantity + $qty;
                    $invItem->unit_price = $price;
                    $invItem->unit_cost = $price;
                    $invItem->save();
                } else {
                    $invItem = InventoryItem::create([
                        'organization_id' => $orgId,
                        'owner_id'        => $purchase->owner_id,
                        'item_kind'       => $kind,
                        'location_type'   => 'warehouse',
                        'location_id'     => 0,
                        'unit_id'         => null,
                        'name'            => $item->item_name,
                        'category'        => 'Purchases',
                        'quantity'        => $qty,
                        'unit_price'      => $price,
                        'unit_cost'       => $price,
                    ]);
                }

                $item->update(['inventory_item_id' => $invItem->id]);

                InventoryMovement::create([
                    'organization_id'   => $orgId,
                    'inventory_item_id' => $invItem->id,
                    'type'              => 'purchase_receive',
                    'quantity_delta'    => $qty,
                    'quantity_after'    => $invItem->quantity,
                    'reference_type'    => 'purchase',
                    'reference_id'      => $purchase->id,
                    'actor_user_id'     => $actorUserId,
                    'meta'              => [
                        'purchase_item_id' => $item->id,
                        'supplier_name'    => $purchase->supplier_name,
                    ],
                    'created_at'        => now(),
                ]);
            }

            $purchase->update(['status' => 'received']);

            return $purchase->load('items');
        });
    }

    /**
     * Inventory summary report for organization.
     */
    public function summary(int $orgId): array
    {
        $warehouseCount = InventoryItem::where('organization_id', $orgId)
            ->where('location_type', 'warehouse')
            ->count();

        $unitCount = InventoryItem::where('organization_id', $orgId)
            ->where('location_type', 'unit')
            ->count();

        $assetsCount = InventoryItem::where('organization_id', $orgId)
            ->where('item_kind', 'asset')
            ->count();

        $lowStockItems = InventoryItem::where('organization_id', $orgId)
            ->where('location_type', 'warehouse')
            ->where('item_kind', 'stock')
            ->whereNotNull('min_stock_alert')
            ->whereColumn('quantity', '<=', 'min_stock_alert')
            ->get(['id', 'name', 'category', 'quantity', 'min_stock_alert']);

        return [
            'total_warehouse_items' => $warehouseCount,
            'total_unit_items'      => $unitCount,
            'total_assets'          => $assetsCount,
            'low_stock_count'       => $lowStockItems->count(),
            'low_stock_items'       => $lowStockItems->toArray(),
        ];
    }

    /**
     * Unit inventory addendum for tenancy contracts.
     */
    public function unitAddendum(int $orgId, int $unitId): array
    {
        $unit = Unit::where('id', $unitId)
            ->where('organization_id', $orgId)
            ->firstOrFail();

        $items = InventoryItem::where('organization_id', $orgId)
            ->where('location_type', 'unit')
            ->where('unit_id', $unitId)
            ->get([
                'id',
                'name',
                'category',
                'item_kind',
                'quantity',
                'brand',
                'model',
                'serial_number',
                'condition',
                'notes',
            ]);

        return [
            'unit_id'     => $unit->id,
            'unit_number' => $unit->number,
            'items'       => $items->toArray(),
        ];
    }
}
