<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\Purchase;
use App\Domain\Maintenance\Services\MaintenanceService;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(private readonly MaintenanceService $maintenance)
    {
    }
    private function assertPurchaseAccess(Request $request, Purchase $purchase): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            abort_unless((int) $purchase->owner_id === (int) $ownerId, 403, 'Unauthorized access to this purchase order.');
        }
    }

    public function index(Request $request)
    {
        $query = Purchase::with('items');

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->where('owner_id', $ownerId);
        }

        $purchases = $query->latest('purchase_date')->get();
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

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $validated['owner_id'] = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
        }

        $purchase = $this->maintenance->createPurchase($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Purchase created.',
            'data'    => ['purchase' => $purchase->load('items')],
        ], 201);
    }

    public function show(Request $request, Purchase $purchase)
    {
        $this->assertPurchaseAccess($request, $purchase);
        return response()->json(['status' => 'success', 'data' => ['purchase' => $purchase->load('items')]]);
    }

    public function updateStatus(Request $request, Purchase $purchase)
    {
        $this->assertPurchaseAccess($request, $purchase);
        $validated = $request->validate([
            'status' => 'required|in:pending,received,cancelled',
        ]);

        $purchase->update(['status' => $validated['status']]);

        return response()->json(['status' => 'success', 'message' => 'Purchase status updated.', 'data' => ['purchase' => $purchase]]);
    }

    public function destroy(Request $request, Purchase $purchase)
    {
        $this->assertPurchaseAccess($request, $purchase);
        $purchase->delete();
        return response()->json(['status' => 'success', 'message' => 'Purchase deleted.']);
    }
}
