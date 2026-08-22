<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\Purchase;
use App\Domain\Maintenance\Models\PurchaseItem;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function index()
    {
        $purchases = Purchase::with('items')->latest('purchase_date')->get();
        return response()->json(['status' => 'success', 'data' => ['purchases' => $purchases]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name'     => 'required|string|max:255',
            'purchase_date'     => 'required|date',
            'remark'            => 'nullable|string',
            'items'             => 'required|array|min:1',
            'items.*.item_id'   => 'nullable|integer',
            'items.*.item_name' => 'required_without:items.*.item_id|nullable|string|max:255',
            'items.*.qty'       => 'required|integer|min:1',
            'items.*.price'     => 'required|numeric|min:0',
        ]);

        $purchase = Purchase::create([
            'supplier_name' => $validated['supplier_name'],
            'purchase_date' => $validated['purchase_date'],
            'remark'        => $validated['remark'] ?? null,
            'status'        => 'pending',
            'total_amount'  => collect($validated['items'])->sum(fn ($i) => $i['qty'] * $i['price']),
        ]);

        foreach ($validated['items'] as $item) {
            $purchase->items()->create($item);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Purchase created.',
            'data'    => ['purchase' => $purchase->load('items')],
        ], 201);
    }

    public function show(Purchase $purchase)
    {
        return response()->json(['status' => 'success', 'data' => ['purchase' => $purchase->load('items')]]);
    }

    public function updateStatus(Request $request, Purchase $purchase)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,received,cancelled',
        ]);

        $purchase->update(['status' => $validated['status']]);

        return response()->json(['status' => 'success', 'message' => 'Purchase status updated.', 'data' => ['purchase' => $purchase]]);
    }

    public function destroy(Purchase $purchase)
    {
        $purchase->delete();
        return response()->json(['status' => 'success', 'message' => 'Purchase deleted.']);
    }
}
