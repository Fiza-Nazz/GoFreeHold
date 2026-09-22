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

    private function assertStockAccess(Request $request, ItemStore $itemStore): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            abort_unless((int) $itemStore->owner_id === (int) $ownerId, 403, 'Unauthorized access to this stock item.');
        }
    }

    public function index(Request $request)
    {
        $query = ItemStore::with('item:id,name,category,brand');

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->where('owner_id', $ownerId);
        }

        return response()->json(['status' => 'success', 'data' => ['item_store' => $query->get()]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'qty'     => 'required|integer|min:0',
            'remark'  => 'nullable|string',
        ]);

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $validated['owner_id'] = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
        }

        $stock = $this->maintenance->createItemStore($validated);
        return response()->json(['status' => 'success', 'message' => 'Stock entry created.', 'data' => ['stock' => $stock->load('item')]], 201);
    }

    public function show(Request $request, ItemStore $itemStore)
    {
        $this->assertStockAccess($request, $itemStore);
        return response()->json(['status' => 'success', 'data' => ['stock' => $itemStore->load('item')]]);
    }

    public function update(Request $request, ItemStore $itemStore)
    {
        $this->assertStockAccess($request, $itemStore);
        $this->maintenance->updateItemStore($itemStore, $request->validate(['qty' => 'integer|min:0', 'remark' => 'nullable|string']));
        return response()->json(['status' => 'success', 'message' => 'Stock updated.', 'data' => ['stock' => $itemStore]]);
    }

    public function destroy(Request $request, ItemStore $itemStore)
    {
        $this->assertStockAccess($request, $itemStore);
        $this->maintenance->deleteItemStore($itemStore);
        return response()->json(['status' => 'success', 'message' => 'Stock entry deleted.']);
    }
}
