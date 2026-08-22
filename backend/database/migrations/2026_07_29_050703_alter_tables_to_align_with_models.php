<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Contracts Table (add type, notes, update status enum to include renewed/settled)
        Schema::table('contracts', function (Blueprint $table) {
            if (!Schema::hasColumn('contracts', 'type')) {
                $table->string('type')->default('residential')->after('deposit_amount');
            }
            if (!Schema::hasColumn('contracts', 'notes')) {
                $table->text('notes')->nullable()->after('type');
            }
        });
        
        // Skip the pure enum modification statement as SQLite doesn't natively support ENUM column types or MODIFY COLUMN operations the way MySQL does.
        // It will accept string values without strict ENUM constraint validation anyway.
        // DB::statement("ALTER TABLE contracts MODIFY COLUMN status ENUM('active', 'expired', 'renewed', 'settled', 'vacated', 'terminated') DEFAULT 'active'");

        // 2. PDC Cheques (update bank to bank_name, add notes)
        Schema::table('pdc_cheques', function (Blueprint $table) {
            if (Schema::hasColumn('pdc_cheques', 'bank') && !Schema::hasColumn('pdc_cheques', 'bank_name')) {
                $table->renameColumn('bank', 'bank_name');
            }
            if (!Schema::hasColumn('pdc_cheques', 'notes')) {
                $table->text('notes')->nullable();
            }
        });

        // 3. Contract Call Logs (align with model)
        Schema::table('contract_call_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('contract_call_logs', 'call_date')) {
                $table->date('call_date')->nullable();
            }
            if (!Schema::hasColumn('contract_call_logs', 'subject')) {
                $table->string('subject')->nullable();
            }
            if (!Schema::hasColumn('contract_call_logs', 'outcome')) {
                $table->string('outcome')->nullable();
            }
        });

        // 4. Legal Cases (align with model case_title, case_status, description)
        Schema::table('legal_cases', function (Blueprint $table) {
            if (!Schema::hasColumn('legal_cases', 'case_title')) {
                $table->string('case_title')->nullable();
            }
            if (!Schema::hasColumn('legal_cases', 'case_status')) {
                $table->string('case_status')->nullable();
            }
            if (!Schema::hasColumn('legal_cases', 'description')) {
                $table->text('description')->nullable();
            }
        });

        // 5. Inventory Items
        Schema::table('inventory_items', function (Blueprint $table) {
            if (!Schema::hasColumn('inventory_items', 'unit_id')) {
                $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            }
            if (!Schema::hasColumn('inventory_items', 'unit_price')) {
                $table->decimal('unit_price', 10, 2)->default(0);
            }
            if (!Schema::hasColumn('inventory_items', 'category')) {
                $table->string('category')->nullable();
            }
            if (!Schema::hasColumn('inventory_items', 'min_stock_alert')) {
                $table->integer('min_stock_alert')->nullable();
            }
        });

        // 6. Purchase Orders
        Schema::table('purchase_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('purchase_orders', 'po_number')) {
                $table->string('po_number')->nullable();
            }
            if (!Schema::hasColumn('purchase_orders', 'supplier_name')) {
                $table->string('supplier_name')->nullable();
            }
            if (!Schema::hasColumn('purchase_orders', 'item_name')) {
                $table->string('item_name')->nullable();
            }
            if (!Schema::hasColumn('purchase_orders', 'total_amount')) {
                $table->decimal('total_amount', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('purchase_orders', 'order_date')) {
                $table->date('order_date')->nullable();
            }
        });

        // 7. Rent Ledger (soft deletes)
        Schema::table('rent_ledger', function (Blueprint $table) {
            if (!Schema::hasColumn('rent_ledger', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // 8. Tenants (name, email)
        Schema::table('tenants', function (Blueprint $table) {
            if (!Schema::hasColumn('tenants', 'name')) {
                $table->string('name')->nullable();
            }
            if (!Schema::hasColumn('tenants', 'email')) {
                $table->string('email')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Reverse operations can be skipped for this corrective script
    }
};
