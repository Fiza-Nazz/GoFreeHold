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
        $tenant = Tenant::where('user_id', $user->id)->first();
        abort_unless($tenant, 403, 'A tenant profile and active contract are required to submit a complaint.');
        $allowed = Contract::where('tenant_id', $tenant->id)
            ->where('unit_id', $data['unit_id'])->whereIn('status', ['active', 'renewed'])->exists();
        if (! $allowed) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'unit_id' => ['Select a unit from your active contracts.'],
            ]);
        }

        unset($data['category']);
        $data['tenant_id'] = $tenant->id;
        $data['status'] = 'open';

        return Complaint::create($data);
    }

    public function assignComplaint(Complaint $complaint, array $data, int $assignedBy): Job
    {
        return DB::transaction(function () use ($complaint, $data, $assignedBy) {
            app(JobAccessService::class)->technician($complaint, (int) $data['assigned_to']);
            $complaint = Complaint::lockForUpdate()->findOrFail($complaint->id);
            abort_if(Job::where('complaint_id', $complaint->id)->count() > 1, 409, 'This complaint has multiple jobs. Admin must review the duplicate records before assignment.');
            $job = Job::updateOrCreate(
                ['complaint_id' => $complaint->id],
                [
                    'assigned_to' => $data['assigned_to'],
                    'assigned_by' => $assignedBy,
                    'team_id' => $data['team_id'] ?? null,
                    'status' => 'assigned',
                    'completed_at' => null,
                    'notes' => $data['notes'] ?? null,
                ],
            );

            $complaint->update(['status' => 'assigned', 'assigned_to' => $data['assigned_to']]);

            DB::table('staff_access_audits')->insert(['actor_id' => $assignedBy, 'owner_id' => $complaint->unit->property->owner_id, 'action' => 'job.assigned', 'target_id' => $job->id, 'details' => json_encode(['assigned_to' => $data['assigned_to']]), 'created_at' => now(), 'updated_at' => now()]);

            return $job;
        });
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
