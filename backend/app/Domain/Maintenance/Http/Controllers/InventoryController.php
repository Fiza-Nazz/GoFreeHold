<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * Get warehouse stock (location_type = warehouse)
     */
    public function warehouseItems()
    {
        $items = InventoryItem::where('location_type', 'warehouse')->get();
        return response()->json(['status' => 'success', 'data' => ['items' => $items]]);
    }

    /**
     * Get unit-assigned inventory items (location_type = unit)
     */
    public function unitItems(Request $request)
    {
        $query = InventoryItem::where('location_type', 'unit')->with('unit:id,number,property_id', 'unit.property:id,name');

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

        // Keep legacy location_id + unit_cost in sync with current columns
        $validated['location_id'] = $validated['location_type'] === 'unit'
            ? (int) $validated['unit_id']
            : 0;
        $validated['unit_cost'] = $validated['unit_price'];

        $item = InventoryItem::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Inventory item added.', 'data' => ['item' => $item]], 201);
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'name'            => 'string|max:255',
            'category'        => 'string|max:100',
            'quantity'        => 'integer|min:0',
            'unit_price'      => 'numeric|min:0',
            'min_stock_alert' => 'nullable|integer|min:0',
            'notes'           => 'nullable|string',
        ]);

        if (array_key_exists('unit_price', $validated)) {
            $validated['unit_cost'] = $validated['unit_price'];
        }

        $inventoryItem->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Item updated.', 'data' => ['item' => $inventoryItem]]);
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $inventoryItem->delete();
        return response()->json(['status' => 'success', 'message' => 'Inventory item deleted.']);
    }
}
