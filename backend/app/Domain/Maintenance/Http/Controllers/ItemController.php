<?php

namespace App\Domain\Maintenance\Http\Controllers;

use App\Domain\Maintenance\Services\MaintenanceService;
use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function __construct(private readonly MaintenanceService $maintenance)
    {
    }

    public function index()
    {
        return response()->json(['status' => 'success', 'data' => ['items' => Item::with('store')->latest()->get()]]);
    }

    public function store(Request $request)
    {
        $item = $this->maintenance->createItem($request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'remark' => 'nullable|string',
        ]));

        return response()->json(['status' => 'success', 'message' => 'Item created.', 'data' => ['item' => $item]], 201);
    }

    public function show(Item $item)
    {
        return response()->json(['status' => 'success', 'data' => ['item' => $item->load('store', 'unitItems.unit:id,number')]]);
    }

    public function update(Request $request, Item $item)
    {
        $this->maintenance->updateItem($item, $request->validate([
            'name' => 'string|max:255',
            'category' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'remark' => 'nullable|string',
        ]));

        return response()->json(['status' => 'success', 'message' => 'Item updated.', 'data' => ['item' => $item]]);
    }

    public function destroy(Item $item)
    {
        $this->maintenance->deleteItem($item);
        return response()->json(['status' => 'success', 'message' => 'Item deleted.']);
    }
}
