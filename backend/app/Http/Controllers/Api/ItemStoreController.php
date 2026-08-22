<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ItemStore;
use Illuminate\Http\Request;

class ItemStoreController extends Controller
{
    public function index()
    {
        $stock = ItemStore::with('item:id,name,category,brand')->get();
        return response()->json(['status' => 'success', 'data' => ['item_store' => $stock]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'qty'     => 'required|integer|min:0',
            'remark'  => 'nullable|string',
        ]);

        $stock = ItemStore::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Stock entry created.', 'data' => ['stock' => $stock->load('item')]], 201);
    }

    public function show(ItemStore $itemStore)
    {
        return response()->json(['status' => 'success', 'data' => ['stock' => $itemStore->load('item')]]);
    }

    public function update(Request $request, ItemStore $itemStore)
    {
        $validated = $request->validate([
            'qty'    => 'integer|min:0',
            'remark' => 'nullable|string',
        ]);

        $itemStore->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Stock updated.', 'data' => ['stock' => $itemStore]]);
    }

    public function destroy(ItemStore $itemStore)
    {
        $itemStore->delete();
        return response()->json(['status' => 'success', 'message' => 'Stock entry deleted.']);
    }
}
