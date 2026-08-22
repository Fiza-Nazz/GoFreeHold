<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UnitItem;
use Illuminate\Http\Request;

class UnitItemController extends Controller
{
    public function index(Request $request)
    {
        $query = UnitItem::with(['unit:id,number', 'item:id,name,category']);

        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        return response()->json(['status' => 'success', 'data' => ['unit_items' => $query->get()]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id'  => 'required|exists:units,id',
            'item_id'  => 'required|exists:items,id',
            'qty'      => 'required|integer|min:1',
            'serial'   => 'nullable|string|max:255',
            'warranty' => 'nullable|string|max:255',
            'remark'   => 'nullable|string',
            'image'    => 'nullable|file|image|max:4096',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('unit-items', 'public');
        }

        $unitItem = UnitItem::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Unit item added.', 'data' => ['unit_item' => $unitItem->load('item')]], 201);
    }

    public function show(UnitItem $unitItem)
    {
        $unitItem->load(['unit:id,number', 'item']);
        return response()->json(['status' => 'success', 'data' => ['unit_item' => $unitItem]]);
    }

    public function update(Request $request, UnitItem $unitItem)
    {
        $validated = $request->validate([
            'qty'      => 'integer|min:1',
            'serial'   => 'nullable|string|max:255',
            'warranty' => 'nullable|string|max:255',
            'remark'   => 'nullable|string',
            'image'    => 'nullable|file|image|max:4096',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('unit-items', 'public');
        }

        $unitItem->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Unit item updated.', 'data' => ['unit_item' => $unitItem]]);
    }

    public function destroy(UnitItem $unitItem)
    {
        $unitItem->delete();
        return response()->json(['status' => 'success', 'message' => 'Unit item removed.']);
    }
}
