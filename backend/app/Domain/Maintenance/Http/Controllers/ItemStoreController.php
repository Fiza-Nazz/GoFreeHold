<?php

namespace App\Domain\Maintenance\Http\Controllers;

use App\Domain\Maintenance\Services\MaintenanceService;
use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\ItemStore;
use Illuminate\Http\Request;

class ItemStoreController extends Controller
{
    public function __construct(private readonly MaintenanceService $maintenance)
    {
    }

    public function index()
    {
        return response()->json(['status' => 'success', 'data' => ['item_store' => ItemStore::with('item:id,name,category,brand')->get()]]);
    }

    public function store(Request $request)
    {
        $stock = $this->maintenance->createItemStore($request->validate([
            'item_id' => 'required|exists:items,id',
            'qty' => 'required|integer|min:0',
            'remark' => 'nullable|string',
        ]));
        return response()->json(['status' => 'success', 'message' => 'Stock entry created.', 'data' => ['stock' => $stock->load('item')]], 201);
    }

    public function show(ItemStore $itemStore)
    {
        return response()->json(['status' => 'success', 'data' => ['stock' => $itemStore->load('item')]]);
    }

    public function update(Request $request, ItemStore $itemStore)
    {
        $this->maintenance->updateItemStore($itemStore, $request->validate(['qty' => 'integer|min:0', 'remark' => 'nullable|string']));
        return response()->json(['status' => 'success', 'message' => 'Stock updated.', 'data' => ['stock' => $itemStore]]);
    }

    public function destroy(ItemStore $itemStore)
    {
        $this->maintenance->deleteItemStore($itemStore);
        return response()->json(['status' => 'success', 'message' => 'Stock entry deleted.']);
    }
}
