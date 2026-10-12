<?php

namespace App\Domain\Maintenance\Http\Controllers;

use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Maintenance\Models\Purchase;
use App\Domain\Maintenance\Services\InventoryService;
use App\Domain\Maintenance\Services\MaintenanceService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(
        private readonly MaintenanceService $maintenance,
        private readonly InventoryService $inventoryService,
        private readonly OwnerContextResolver $ownerResolver
    ) {
    }

    private function resolveOrgId(Request $request): int
    {
        return $this->ownerResolver->organizationId($request->user());
    }

    private function resolveOwnerId(Request $request): ?int
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            try {
                return $this->ownerResolver->ownerId($user);
            } catch (\Throwable $e) {
                return null;
            }
        }
        return null;
    }

    private function assertPurchaseAccess(Request $request, Purchase $purchase): void
    {
        $orgId = $this->resolveOrgId($request);
        abort_unless((int) $purchase->organization_id === (int) $orgId, 403, 'Unauthorized access to this purchase order.');
    }

    public function index(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $query = Purchase::where('organization_id', $orgId)->with('items');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $purchases = $query->latest('purchase_date')->get();

        return response()->json([
            'status' => 'success',
            'data'   => ['purchases' => $purchases],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $ownerId = $this->resolveOwnerId($request);

        $validated = $request->validate([
            'supplier_name'     => 'required|string|max:255',
            'purchase_date'     => 'required|date',
            'remark'            => 'nullable|string',
            'items'             => 'required|array|min:1',
            'items.*.item_id'   => 'nullable|integer',
            'items.*.item_name' => 'required_without:items.*.item_id|nullable|string|max:255',
            'items.*.qty'       => 'required|numeric|min:0.01',
            'items.*.price'     => 'required|numeric|min:0',
            'items.*.item_kind' => 'nullable|in:stock,asset',
        ]);

        $validated['organization_id'] = $orgId;
        $validated['owner_id'] = $ownerId;

        $purchase = $this->maintenance->createPurchase($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Purchase created.',
            'data'    => ['purchase' => $purchase->load('items')],
        ], 201);
    }

    public function show(Request $request, Purchase $purchase): JsonResponse
    {
        $this->assertPurchaseAccess($request, $purchase);

        return response()->json([
            'status' => 'success',
            'data'   => ['purchase' => $purchase->load('items')],
        ]);
    }

    public function updateStatus(Request $request, Purchase $purchase): JsonResponse
    {
        $this->assertPurchaseAccess($request, $purchase);

        $validated = $request->validate([
            'status' => 'required|in:pending,received,cancelled',
        ]);

        $targetStatus = $validated['status'];

        if ($targetStatus === 'received' && $purchase->status !== 'received') {
            $purchase = $this->inventoryService->receivePurchase($purchase, $request->user()->id);
        } else {
            $purchase->update(['status' => $targetStatus]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Purchase status updated.',
            'data'    => ['purchase' => $purchase->load('items')],
        ]);
    }

    public function destroy(Request $request, Purchase $purchase): JsonResponse
    {
        $this->assertPurchaseAccess($request, $purchase);

        $purchase->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Purchase deleted.',
        ]);
    }
}
