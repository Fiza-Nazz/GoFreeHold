<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update inventory_items table
        if (Schema::hasTable('inventory_items')) {
            Schema::table('inventory_items', function (Blueprint $table) {
                if (!Schema::hasColumn('inventory_items', 'organization_id')) {
                    $table->foreignId('organization_id')->nullable()->after('id')->constrained('organizations')->cascadeOnDelete();
                }
                if (!Schema::hasColumn('inventory_items', 'item_kind')) {
                    $table->enum('item_kind', ['stock', 'asset'])->default('stock')->after('organization_id');
                }
                if (!Schema::hasColumn('inventory_items', 'brand')) {
                    $table->string('brand')->nullable()->after('min_stock_alert');
                }
                if (!Schema::hasColumn('inventory_items', 'model')) {
                    $table->string('model')->nullable()->after('brand');
                }
                if (!Schema::hasColumn('inventory_items', 'serial_number')) {
                    $table->string('serial_number')->nullable()->after('model');
                }
                if (!Schema::hasColumn('inventory_items', 'purchase_date')) {
                    $table->date('purchase_date')->nullable()->after('serial_number');
                }
                if (!Schema::hasColumn('inventory_items', 'warranty_expiry')) {
                    $table->date('warranty_expiry')->nullable()->after('purchase_date');
                }
                if (!Schema::hasColumn('inventory_items', 'condition')) {
                    $table->enum('condition', ['brand_new', 'good', 'needs_repair', 'replaced'])->nullable()->after('warranty_expiry');
                }
                if (!Schema::hasColumn('inventory_items', 'sku')) {
                    $table->string('sku')->nullable()->after('notes');
                }
                if (!Schema::hasColumn('inventory_items', 'deleted_at')) {
                    $table->softDeletes();
                }
            });

            // Make sure location_id is nullable (MySQL legacy NOT NULL compatibility)
            try {
                DB::statement("ALTER TABLE `inventory_items` MODIFY COLUMN `location_id` BIGINT UNSIGNED NULL DEFAULT 0");
            } catch (\Throwable $e) {
                // Ignore if not supported
            }

            // Ensure quantity supports decimal(12,2)
            try {
                DB::statement("ALTER TABLE `inventory_items` MODIFY COLUMN `quantity` DECIMAL(12,2) NOT NULL DEFAULT 0.00");
                DB::statement("ALTER TABLE `inventory_items` MODIFY COLUMN `unit_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00");
                DB::statement("ALTER TABLE `inventory_items` MODIFY COLUMN `unit_cost` DECIMAL(12,2) NOT NULL DEFAULT 0.00");
            } catch (\Throwable $e) {
                // Ignore if already modified
            }

            // Add indexes if not present
            try {
                Schema::table('inventory_items', function (Blueprint $table) {
                    $table->index(['organization_id', 'location_type'], 'inv_org_location_idx');
                    $table->index(['organization_id', 'item_kind'], 'inv_org_kind_idx');
                    $table->index(['organization_id', 'unit_id'], 'inv_org_unit_idx');
                    $table->index(['organization_id', 'category'], 'inv_org_category_idx');
                });
            } catch (\Throwable $e) {
                // Indexes might already exist
            }
        }

        // 2. Create inventory_movements table
        if (!Schema::hasTable('inventory_movements')) {
            Schema::create('inventory_movements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
                $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
                $table->enum('type', [
                    'adjustment',
                    'transfer_in',
                    'transfer_out',
                    'purchase_receive',
                    'assign_to_unit',
                    'return_to_warehouse',
                    'contract_snapshot'
                ]);
                $table->decimal('quantity_delta', 12, 2);
                $table->decimal('quantity_after', 12, 2);
                $table->string('reference_type')->nullable();
                $table->unsignedBigInteger('reference_id')->nullable();
                $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->json('meta')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['organization_id', 'created_at'], 'inv_mov_org_created_idx');
                $table->index(['inventory_item_id', 'created_at'], 'inv_mov_item_created_idx');
            });
        }

        // 3. Update purchases & purchase_items
        if (Schema::hasTable('purchases') && !Schema::hasColumn('purchases', 'organization_id')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->foreignId('organization_id')->nullable()->after('id')->constrained('organizations')->nullOnDelete();
            });
        }

        if (Schema::hasTable('purchase_items')) {
            Schema::table('purchase_items', function (Blueprint $table) {
                if (!Schema::hasColumn('purchase_items', 'inventory_item_id')) {
                    $table->foreignId('inventory_item_id')->nullable()->after('item_id')->constrained('inventory_items')->nullOnDelete();
                }
                if (!Schema::hasColumn('purchase_items', 'item_kind')) {
                    $table->enum('item_kind', ['stock', 'asset'])->default('stock')->after('price');
                }
            });
        }

        // 4. Data migration: migrate legacy appliances into inventory_items
        if (Schema::hasTable('appliances')) {
            $appliances = DB::table('appliances')->get();
            foreach ($appliances as $appliance) {
                // Check if already migrated by checking unit_id and serial_number or name
                $exists = DB::table('inventory_items')
                    ->where('unit_id', $appliance->unit_id)
                    ->where('name', $appliance->name)
                    ->where('item_kind', 'asset')
                    ->when($appliance->serial_number, fn ($q) => $q->where('serial_number', $appliance->serial_number))
                    ->exists();

                if (!$exists) {
                    // Resolve organization_id from unit
                    $unit = DB::table('units')->where('id', $appliance->unit_id)->first();
                    $orgId = $unit?->organization_id;
                    $ownerId = $unit?->owner_id;

                    if (!$orgId && $ownerId) {
                        $ownerUser = DB::table('owners')->where('id', $ownerId)->value('user_id');
                        $orgId = $ownerUser ? DB::table('users')->where('id', $ownerUser)->value('organization_id') : 1;
                    }

                    $orgId = $orgId ?: 1;

                    DB::table('inventory_items')->insert([
                        'organization_id' => $orgId,
                        'owner_id'        => $ownerId,
                        'item_kind'       => 'asset',
                        'location_type'   => 'unit',
                        'location_id'     => (int) $appliance->unit_id,
                        'unit_id'         => $appliance->unit_id,
                        'name'            => $appliance->name,
                        'category'        => 'Appliances',
                        'quantity'        => 1.00,
                        'unit_price'      => 0.00,
                        'unit_cost'       => 0.00,
                        'brand'           => $appliance->brand,
                        'model'           => $appliance->model,
                        'serial_number'   => $appliance->serial_number,
                        'purchase_date'   => $appliance->purchase_date,
                        'warranty_expiry' => $appliance->warranty_expiry,
                        'condition'       => in_array($appliance->condition, ['brand_new', 'good', 'needs_repair', 'replaced']) ? $appliance->condition : 'good',
                        'notes'           => $appliance->notes,
                        'created_at'      => $appliance->created_at ?: now(),
                        'updated_at'      => $appliance->updated_at ?: now(),
                    ]);
                }
            }
        }

        // 5. Backfill organization_id for any existing inventory_items without organization_id
        $itemsWithoutOrg = DB::table('inventory_items')->whereNull('organization_id')->get();
        foreach ($itemsWithoutOrg as $item) {
            $orgId = null;
            if ($item->unit_id) {
                $orgId = DB::table('units')->where('id', $item->unit_id)->value('organization_id');
            }
            if (!$orgId && $item->owner_id) {
                $ownerUser = DB::table('owners')->where('id', $item->owner_id)->value('user_id');
                $orgId = $ownerUser ? DB::table('users')->where('id', $ownerUser)->value('organization_id') : null;
            }
            $orgId = $orgId ?: 1;
            DB::table('inventory_items')->where('id', $item->id)->update(['organization_id' => $orgId]);
        }

        // 6. Backfill organization_id for purchases
        if (Schema::hasTable('purchases')) {
            $purchasesWithoutOrg = DB::table('purchases')->whereNull('organization_id')->get();
            foreach ($purchasesWithoutOrg as $purchase) {
                $orgId = null;
                if ($purchase->owner_id) {
                    $ownerUser = DB::table('owners')->where('id', $purchase->owner_id)->value('user_id');
                    $orgId = $ownerUser ? DB::table('users')->where('id', $ownerUser)->value('organization_id') : null;
                }
                $orgId = $orgId ?: 1;
                DB::table('purchases')->where('id', $purchase->id)->update(['organization_id' => $orgId]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');

        if (Schema::hasTable('purchase_items')) {
            Schema::table('purchase_items', function (Blueprint $table) {
                if (Schema::hasColumn('purchase_items', 'inventory_item_id')) {
                    $table->dropConstrainedForeignId('inventory_item_id');
                }
                if (Schema::hasColumn('purchase_items', 'item_kind')) {
                    $table->dropColumn('item_kind');
                }
            });
        }

        if (Schema::hasTable('purchases') && Schema::hasColumn('purchases', 'organization_id')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->dropConstrainedForeignId('organization_id');
            });
        }

        if (Schema::hasTable('inventory_items')) {
            Schema::table('inventory_items', function (Blueprint $table) {
                $table->dropSoftDeletes();
                $columns = ['organization_id', 'item_kind', 'brand', 'model', 'serial_number', 'purchase_date', 'warranty_expiry', 'condition', 'sku'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('inventory_items', $column)) {
                        if ($column === 'organization_id') {
                            $table->dropConstrainedForeignId('organization_id');
                        } else {
                            $table->dropColumn($column);
                        }
                    }
                }
            });
        }
    }
};
