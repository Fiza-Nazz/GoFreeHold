<?php

namespace App\Domain\Maintenance\Services;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Maintenance\Models\InventoryItem;
use App\Domain\Maintenance\Models\Job;
use App\Domain\Maintenance\Models\Purchase;
use App\Domain\Maintenance\Models\Item;
use App\Domain\Maintenance\Models\ItemStore;
use App\Domain\Maintenance\Models\UnitItem;
use Illuminate\Support\Facades\DB;

class MaintenanceService
{
    public function createComplaint(User $user, array $data): Complaint
    {
        return app(ComplaintWorkflowService::class)->create($data, $user);
    }

    public function assignComplaint(Complaint $complaint, array $data, int $assignedBy): Job
    {
        $actor = User::findOrFail($assignedBy);
        return app(ComplaintWorkflowService::class)->assign($complaint, $data, $actor);
    }

    public function createInventoryItem(array $data): InventoryItem
    {
        $data['location_id'] = $data['location_type'] === 'unit' ? (int) $data['unit_id'] : 0;
        $data['unit_cost'] = $data['unit_price'];

        return InventoryItem::create($data);
    }

    public function updateInventoryItem(InventoryItem $item, array $data): InventoryItem
    {
        if (array_key_exists('unit_price', $data)) {
            $data['unit_cost'] = $data['unit_price'];
        }
        $item->update($data);

        return $item;
    }

    public function createPurchase(array $data): Purchase
    {
        return DB::transaction(function () use ($data) {
            $purchase = Purchase::create([
                'organization_id' => $data['organization_id'] ?? null,
                'owner_id' => $data['owner_id'] ?? null,
                'supplier_name' => $data['supplier_name'],
                'purchase_date' => $data['purchase_date'],
                'remark' => $data['remark'] ?? null,
                'status' => 'pending',
                'total_amount' => collect($data['items'])->sum(fn (array $item) => $item['qty'] * $item['price']),
            ]);

            foreach ($data['items'] as $item) {
                $purchase->items()->create($item);
            }

            return $purchase->load('items');
        });
    }

    public function createItem(array $data): Item
    {
        return Item::create($data);
    }

    public function createUnitItem(array $data): UnitItem
    {
        return UnitItem::create($data);
    }

    public function createItemStore(array $data): ItemStore
    {
        return ItemStore::create($data);
    }

    public function updateItem(Item $item, array $data): Item
    {
        $item->update($data);
        return $item;
    }

    public function deleteItem(Item $item): void
    {
        $item->delete();
    }

    public function updateUnitItem(UnitItem $item, array $data): UnitItem
    {
        $item->update($data);
        return $item;
    }

    public function deleteUnitItem(UnitItem $item): void
    {
        $item->delete();
    }

    public function updateItemStore(ItemStore $stock, array $data): ItemStore
    {
        $stock->update($data);
        return $stock;
    }

    public function deleteItemStore(ItemStore $stock): void
    {
        $stock->delete();
    }
}
