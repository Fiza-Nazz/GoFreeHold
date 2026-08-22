<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Owner;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\Unit;
use App\Models\Contract;
use App\Models\Payment;
use App\Models\RentTransaction;
use App\Models\ContractCheque;
use App\Models\Settlement;
use App\Models\Complaint;
use App\Models\Team;
use App\Models\Job;
use App\Models\Item;
use App\Models\UnitItem;
use App\Models\ItemStore;
use App\Models\InventoryItem;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\ServiceCharge;
use App\Models\Category;
use App\Models\Income;
use App\Models\Expense;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

/**
 * Full verification dataset for end-to-end testing.
 * Safe to re-run: clears domain data first (keeps auth demo users if present).
 */
class VerificationSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        foreach ([
            'expenses', 'incomes', 'categories', 'service_charges', 'purchase_items', 'purchases',
            'inventory_items', 'item_store', 'unit_items', 'items', 'jobs', 'complaints', 'teams',
            'settlement_payments', 'settlement_docs', 'settlements',
            'contract_cheques', 'payments', 'rent_transactions', 'contracts',
            'units', 'properties', 'tenants', 'owners',
        ] as $t) {
            if (DB::getSchemaBuilder()->hasTable($t)) {
                DB::table($t)->truncate();
            }
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Users (roles) — always refresh password so re-seed fixes stale hashes (422 login)
        $demoPassword = Hash::make('password');
        $upsertUser = static function (string $email, string $name, string $role) use ($demoPassword): User {
            $user = User::updateOrCreate(
                ['email' => $email],
                ['name' => $name, 'role' => $role, 'password' => $demoPassword]
            );

            return $user;
        };

        $admin = $upsertUser('admin@gofreehold.com', 'Admin User', 'admin');
        $maint = $upsertUser('maintenance@gofreehold.com', 'Maintenance User', 'maintenance');
        $ownerUser1 = $upsertUser('owner1@gofreehold.com', 'Owner One', 'owner');
        $ownerUser2 = $upsertUser('owner2@gofreehold.com', 'Owner Two', 'owner');
        $tenantUser1 = $upsertUser('tenant1@gofreehold.com', 'Tenant One', 'tenant');
        $tenantUser2 = $upsertUser('tenant2@gofreehold.com', 'Tenant Two', 'tenant');
        $tenantUser3 = $upsertUser('tenant3@gofreehold.com', 'Tenant Three', 'tenant');
        // Aliases used by DatabaseSeeder / docs — tenant@ is the demo login for the active lease.
        $upsertUser('owner@gofreehold.com', 'Owner User', 'owner');
        $tenantAlias = $upsertUser('tenant@gofreehold.com', 'Tenant User', 'tenant');

        $owner1 = Owner::create(['user_id' => $ownerUser1->id, 'name' => 'Owner One Profile', 'email' => $ownerUser1->email, 'contact' => '0501111111']);
        $owner2 = Owner::create(['user_id' => $ownerUser2->id, 'name' => 'Owner Two Profile', 'email' => $ownerUser2->email, 'contact' => '0502222222']);

        $t1 = Tenant::create(['user_id' => $tenantAlias->id, 'name' => 'Tenant One', 'email' => $tenantAlias->email, 'contact' => '0503333333', 'address' => 'Dubai Marina']);
        $t2 = Tenant::create(['user_id' => $tenantUser2->id, 'name' => 'Tenant Two', 'email' => $tenantUser2->email, 'contact' => '0504444444', 'address' => 'JLT']);
        $t3 = Tenant::create(['user_id' => $tenantUser3->id, 'name' => 'Tenant Three', 'email' => $tenantUser3->email, 'contact' => '0505555555', 'address' => 'Business Bay']);

        $p1 = Property::create(['owner_id' => $owner1->id, 'name' => 'Marina Tower', 'address' => 'Marina Walk 1', 'city' => 'Dubai', 'description' => 'Waterfront', 'type' => 'residential', 'total_units' => 0]);
        $p2 = Property::create(['owner_id' => $owner1->id, 'name' => 'JLT Heights', 'address' => 'Cluster X', 'city' => 'Dubai', 'description' => 'Lake view', 'type' => 'residential', 'total_units' => 0]);
        $p3 = Property::create(['owner_id' => $owner2->id, 'name' => 'Bay Office', 'address' => 'BB Avenue', 'city' => 'Dubai', 'description' => 'Commercial', 'type' => 'commercial', 'total_units' => 0]);

        $u1 = Unit::create(['property_id' => $p1->id, 'owner_id' => $owner1->id, 'number' => '101', 'floor' => 1, 'type' => '1BR', 'size' => 750, 'furnished' => true, 'price' => 55000, 'status' => 'OCCUPIED']);
        $u2 = Unit::create(['property_id' => $p1->id, 'owner_id' => $owner1->id, 'number' => '102', 'floor' => 1, 'type' => 'studio', 'size' => 450, 'furnished' => false, 'price' => 40000, 'status' => 'AVAILABLE']);
        $u3 = Unit::create(['property_id' => $p2->id, 'owner_id' => $owner1->id, 'number' => '201', 'floor' => 2, 'type' => '2BR', 'size' => 1100, 'furnished' => true, 'price' => 80000, 'status' => 'OCCUPIED']);
        $u4 = Unit::create(['property_id' => $p2->id, 'owner_id' => $owner1->id, 'number' => '202', 'floor' => 2, 'type' => '1BR', 'size' => 800, 'furnished' => true, 'price' => 60000, 'status' => 'BOOKED']);
        $u5 = Unit::create(['property_id' => $p3->id, 'owner_id' => $owner2->id, 'number' => 'A1', 'floor' => 5, 'type' => 'office', 'size' => 1200, 'furnished' => false, 'price' => 120000, 'status' => 'OCCUPIED']);
        $u6 = Unit::create(['property_id' => $p3->id, 'owner_id' => $owner2->id, 'number' => 'A2', 'floor' => 5, 'type' => 'office', 'size' => 900, 'furnished' => false, 'price' => 95000, 'status' => 'SOLD']);

        foreach ([$p1, $p2, $p3] as $p) {
            $p->update(['total_units' => Unit::where('property_id', $p->id)->count()]);
        }

        $c1 = Contract::create([
            'unit_id' => $u1->id, 'tenant_id' => $t1->id, 'owner_id' => $owner1->id,
            'date' => now()->subMonths(6)->toDateString(), 'start_date' => now()->subMonths(6)->toDateString(),
            'end_date' => now()->addMonths(6)->toDateString(), 'due_date' => now()->startOfMonth()->toDateString(),
            'rent_amount' => 50000, 'security_deposit' => 3000, 'status' => 'active', 'type' => 'residential', 'mode_of_payment' => 'cheque',
        ]);
        $c2 = Contract::create([
            'unit_id' => $u3->id, 'tenant_id' => $t2->id, 'owner_id' => $owner1->id,
            'date' => now()->subMonths(11)->toDateString(), 'start_date' => now()->subMonths(11)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(), 'due_date' => now()->startOfMonth()->toDateString(),
            'rent_amount' => 80000, 'security_deposit' => 5000, 'status' => 'active', 'type' => 'residential', 'mode_of_payment' => 'bank_transfer',
        ]);
        $c3 = Contract::create([
            'unit_id' => $u5->id, 'tenant_id' => $t3->id, 'owner_id' => $owner2->id,
            'date' => now()->subYear()->toDateString(), 'start_date' => now()->subYear()->toDateString(),
            'end_date' => now()->subDays(10)->toDateString(), 'due_date' => now()->subDays(10)->toDateString(),
            'rent_amount' => 120000, 'security_deposit' => 12000, 'status' => 'expired', 'lease_term' => '12 months',
        ]);

        RentTransaction::create(['contract_id' => $c1->id, 'date' => now()->startOfMonth()->toDateString(), 'description' => 'Rent due ' . now()->format('Y-m'), 'debit' => 55000, 'credit' => 0]);
        RentTransaction::create(['contract_id' => $c1->id, 'date' => now()->toDateString(), 'description' => 'Partial rent payment', 'debit' => 0, 'credit' => 20000]);
        RentTransaction::create(['contract_id' => $c2->id, 'date' => now()->startOfMonth()->toDateString(), 'description' => 'Rent due ' . now()->format('Y-m'), 'debit' => 80000, 'credit' => 0]);

        Payment::create([
            'contract_id' => $c1->id, 'tenant_id' => $t1->id, 'type' => 'rent', 'mode' => 'bank_transfer',
            'amount' => 20000, 'date' => now()->toDateString(), 'remarks' => 'Seed payment', 'recorded_by' => $admin->id,
        ]);

        ContractCheque::create([
            'contract_id' => $c1->id, 'cheque_number' => 'CHQ-1001', 'bank_name' => 'Emirates NBD',
            'amount' => 15000, 'due_date' => now()->addDays(5)->toDateString(), 'status' => 'pending',
        ]);
        ContractCheque::create([
            'contract_id' => $c2->id, 'cheque_number' => 'CHQ-1002', 'bank_name' => 'ADCB',
            'amount' => 20000, 'due_date' => now()->addDays(3)->toDateString(), 'status' => 'pending',
        ]);

        Settlement::create([
            'owner_id' => $owner1->id, 'vacant_date' => now()->toDateString(),
            'dues' => 5000, 'receivable' => 2000, 'status' => 'pending', 'on_case' => false,
        ]);

        $team = Team::create(['name' => 'Alpha Team', 'phone' => '0509999999', 'remark' => 'Primary']);
        $complaint = Complaint::create([
            'tenant_id' => $t1->id, 'unit_id' => $u1->id, 'title' => 'AC not cooling',
            'description' => 'Bedroom AC weak', 'status' => 'open', 'priority' => 'high',
        ]);
        Job::create([
            'complaint_id' => $complaint->id, 'team_id' => $team->id, 'assigned_to' => $maint->id,
            'assigned_by' => $admin->id, 'status' => 'assigned', 'scheduled_date' => now()->toDateString(),
        ]);

        $item = Item::create(['name' => 'Split AC', 'category' => 'appliance', 'brand' => 'LG']);
        UnitItem::create(['unit_id' => $u1->id, 'item_id' => $item->id, 'qty' => 1, 'serial' => 'SN-AC-1']);
        ItemStore::create(['item_id' => $item->id, 'qty' => 5, 'remark' => 'Warehouse']);

        // inventory_items table (Admin > Inventory page + Reports > Inventory Summary)
        InventoryItem::create([
            'name' => 'AC Filter', 'category' => 'HVAC', 'quantity' => 12, 'unit_price' => 45,
            'unit_cost' => 45, 'location_type' => 'warehouse', 'location_id' => 0, 'min_stock_alert' => 5,
        ]);
        InventoryItem::create([
            'name' => 'Door Lock Set', 'category' => 'Hardware', 'quantity' => 3, 'unit_price' => 120,
            'unit_cost' => 120, 'location_type' => 'warehouse', 'location_id' => 0, 'min_stock_alert' => 5,
        ]);
        InventoryItem::create([
            'name' => 'Water Heater', 'category' => 'Appliance', 'quantity' => 1, 'unit_price' => 850,
            'unit_cost' => 850, 'location_type' => 'unit', 'location_id' => $u1->id, 'unit_id' => $u1->id,
        ]);

        $purchase = Purchase::create([
            'supplier_name' => 'Gulf Supplies',
            'purchase_date' => now()->toDateString(),
            'total_amount' => 1500,
            'status' => 'pending',
            'remark' => 'Verification seed PO',
        ]);
        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'item_id' => $item->id,
            'item_name' => 'Split AC Filters',
            'qty' => 10,
            'price' => 150,
        ]);

        ServiceCharge::create([
            'contract_id' => $c1->id, 'unit_id' => $u1->id, 'charge_type' => 'maintenance',
            'amount' => 500, 'due_date' => now()->addDays(15)->toDateString(), 'status' => 'pending',
        ]);

        $catIncome = Category::create(['name' => 'Operations Income', 'type' => 'income']);
        $catExpense = Category::create(['name' => 'Operations Expense', 'type' => 'expense']);
        Income::create(['category_id' => $catIncome->id, 'amount' => 1000, 'date' => now()->toDateString(), 'description' => 'Misc income']);
        Expense::create(['category_id' => $catExpense->id, 'amount' => 300, 'date' => now()->toDateString(), 'description' => 'Supplies']);

        $this->command?->info('VerificationSeeder complete.');
        $this->command?->info("Owners={$owner1->id},{$owner2->id} Properties=3 Units=6 Contracts=3");
    }
}
