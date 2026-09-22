<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\InventoryItem;
use App\Domain\Maintenance\Services\MaintenanceService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(private readonly MaintenanceService $maintenance)
    {
    }
    private function assertItemAccess(Request $request, InventoryItem $inventoryItem): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $unitOwnerId = $inventoryItem->unit?->property?->owner_id ?: $inventoryItem->unit?->owner_id;
            abort_unless((int) $inventoryItem->owner_id === (int) $ownerId || (int) $unitOwnerId === (int) $ownerId, 403, 'Unauthorized access to this inventory item.');
        }
    }

    /**
     * Get warehouse stock (location_type = warehouse)
     */
    public function warehouseItems(Request $request)
    {
        $query = InventoryItem::where('location_type', 'warehouse');

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->where('owner_id', $ownerId);
        }

        $items = $query->get();
        return response()->json(['status' => 'success', 'data' => ['items' => $items]]);
    }

    /**
     * Get unit-assigned inventory items (location_type = unit)
     */
    public function unitItems(Request $request)
    {
        $query = InventoryItem::where('location_type', 'unit')->with('unit:id,number,property_id', 'unit.property:id,name');

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->where(function ($q) use ($ownerId) {
                $q->where('owner_id', $ownerId)
                  ->orWhereHas('unit', fn ($u) => $u->where('owner_id', $ownerId)->orWhereHas('property', fn ($p) => $p->where('owner_id', $ownerId)));
            });
        }

        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        return response()->json(['status' => 'success', 'data' => ['items' => $query->get()]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'category'        => 'required|string|max:100',
            'quantity'        => 'required|integer|min:0',
            'unit_price'      => 'required|numeric|min:0',
            'location_type'   => 'required|in:warehouse,unit',
            'unit_id'         => 'nullable|required_if:location_type,unit|exists:units,id',
            'min_stock_alert' => 'nullable|integer|min:0',
            'notes'           => 'nullable|string',
        ]);

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $validated['owner_id'] = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
        }

        $item = $this->maintenance->createInventoryItem($validated);

        return response()->json(['status' => 'success', 'message' => 'Inventory item added.', 'data' => ['item' => $item]], 201);
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $this->assertItemAccess($request, $inventoryItem);
        $validated = $request->validate([
            'name'            => 'string|max:255',
            'category'        => 'string|max:100',
            'quantity'        => 'integer|min:0',
            'unit_price'      => 'numeric|min:0',
            'min_stock_alert' => 'nullable|integer|min:0',
            'notes'           => 'nullable|string',
        ]);

        $inventoryItem = $this->maintenance->updateInventoryItem($inventoryItem, $validated);

        return response()->json(['status' => 'success', 'message' => 'Item updated.', 'data' => ['item' => $inventoryItem]]);
    }

    public function destroy(Request $request, InventoryItem $inventoryItem)
    {
        $this->assertItemAccess($request, $inventoryItem);
        $inventoryItem->delete();
        return response()->json(['status' => 'success', 'message' => 'Inventory item deleted.']);
    }
}
