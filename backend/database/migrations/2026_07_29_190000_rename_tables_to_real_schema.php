<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Step 2 of real-schema alignment: rename draft-era tables to the names
 * used by the client's real database schema.
 *
 *   buildings          -> properties
 *   pdc_cheques        -> contract_cheques
 *   contract_call_logs -> call_logs
 *   maintenance_jobs   -> jobs        (Laravel's queue "jobs" table is moved
 *                                      to "queue_jobs" first; see config/queue.php)
 *   rent_ledger        -> rent_transactions (column redesign happens in Step 6)
 *   purchase_orders    -> purchases + purchase_items (two-table design)
 */
return new class extends Migration
{
    public function up(): void
    {
        // Queue infra table out of the way so the domain "jobs" table can exist.
        Schema::rename('jobs', 'queue_jobs');

        Schema::rename('buildings', 'properties');
        Schema::rename('pdc_cheques', 'contract_cheques');
        Schema::rename('contract_call_logs', 'call_logs');
        Schema::rename('maintenance_jobs', 'jobs');
        Schema::rename('rent_ledger', 'rent_transactions');

        // Real schema splits procurement into purchases + purchase_items.
        // The real schema document lists no column details for these two tables,
        // so this is a minimal conventional design — FLAGGED for client confirmation.
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->string('supplier_name');
            $table->date('purchase_date')->nullable();
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->string('status')->default('pending'); // pending, received, cancelled
            $table->text('remark')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchases')->cascadeOnDelete();
            // FK constraint to items is added in Step 3 once the items table exists.
            $table->unsignedBigInteger('item_id')->nullable()->index();
            $table->string('item_name')->nullable(); // transitional: carried over from purchase_orders
            $table->integer('qty')->default(1);
            $table->decimal('price', 12, 2)->default(0);
            $table->timestamps();
        });

        // Carry over any existing purchase_orders rows (1 order -> 1 purchase + 1 line item).
        $orders = DB::table('purchase_orders')->get();
        foreach ($orders as $order) {
            $purchaseId = DB::table('purchases')->insertGetId([
                'supplier_name' => $order->supplier_name ?? $order->supplier ?? 'Unknown',
                'purchase_date' => $order->order_date,
                'total_amount'  => $order->total_amount ?? $order->total_cost ?? 0,
                'status'        => $order->status ?? 'pending',
                'created_at'    => $order->created_at,
                'updated_at'    => $order->updated_at,
            ]);
            DB::table('purchase_items')->insert([
                'purchase_id' => $purchaseId,
                'item_id'     => $order->item_id,
                'item_name'   => $order->item_name,
                'qty'         => $order->quantity ?? 1,
                'price'       => $order->total_cost ?? 0,
                'created_at'  => $order->created_at,
                'updated_at'  => $order->updated_at,
            ]);
        }

        Schema::dropIfExists('purchase_orders');
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
        Schema::dropIfExists('purchases');

        Schema::rename('rent_transactions', 'rent_ledger');
        Schema::rename('jobs', 'maintenance_jobs');
        Schema::rename('call_logs', 'contract_call_logs');
        Schema::rename('contract_cheques', 'pdc_cheques');
        Schema::rename('properties', 'buildings');
        Schema::rename('queue_jobs', 'jobs');
    }
};
