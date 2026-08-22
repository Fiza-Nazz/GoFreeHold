<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index()
    {
        $items = Item::with('store')->latest()->get();
        return response()->json(['status' => 'success', 'data' => ['items' => $items]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'brand'    => 'nullable|string|max:255',
            'remark'   => 'nullable|string',
        ]);

        $item = Item::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Item created.', 'data' => ['item' => $item]], 201);
    }

    public function show(Item $item)
    {
        $item->load('store', 'unitItems.unit:id,number');
        return response()->json(['status' => 'success', 'data' => ['item' => $item]]);
    }

    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'name'     => 'string|max:255',
            'category' => 'nullable|string|max:255',
            'brand'    => 'nullable|string|max:255',
            'remark'   => 'nullable|string',
        ]);

        $item->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Item updated.', 'data' => ['item' => $item]]);
    }

    public function destroy(Item $item)
    {
        $item->delete();
        return response()->json(['status' => 'success', 'message' => 'Item deleted.']);
    }
}
