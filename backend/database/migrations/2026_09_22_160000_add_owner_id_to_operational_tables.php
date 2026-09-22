<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('inventory_items') && !Schema::hasColumn('inventory_items', 'owner_id')) {
            Schema::table('inventory_items', function (Blueprint $table) {
                $table->foreignId('owner_id')->nullable()->after('id')->constrained('owners')->nullOnDelete();
            });
        }

        if (Schema::hasTable('bank_accounts') && !Schema::hasColumn('bank_accounts', 'owner_id')) {
            Schema::table('bank_accounts', function (Blueprint $table) {
                $table->foreignId('owner_id')->nullable()->after('id')->constrained('owners')->nullOnDelete();
            });
        }

        if (Schema::hasTable('item_store') && !Schema::hasColumn('item_store', 'owner_id')) {
            Schema::table('item_store', function (Blueprint $table) {
                $table->foreignId('owner_id')->nullable()->after('id')->constrained('owners')->nullOnDelete();
            });
        }

        if (Schema::hasTable('purchases') && !Schema::hasColumn('purchases', 'owner_id')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->foreignId('owner_id')->nullable()->after('id')->constrained('owners')->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('inventory_items') && Schema::hasColumn('inventory_items', 'owner_id')) {
            Schema::table('inventory_items', function (Blueprint $table) {
                $table->dropConstrainedForeignId('owner_id');
            });
        }

        if (Schema::hasTable('bank_accounts') && Schema::hasColumn('bank_accounts', 'owner_id')) {
            Schema::table('bank_accounts', function (Blueprint $table) {
                $table->dropConstrainedForeignId('owner_id');
            });
        }

        if (Schema::hasTable('item_store') && Schema::hasColumn('item_store', 'owner_id')) {
            Schema::table('item_store', function (Blueprint $table) {
                $table->dropConstrainedForeignId('owner_id');
            });
        }

        if (Schema::hasTable('purchases') && Schema::hasColumn('purchases', 'owner_id')) {
            Schema::table('purchases', function (Blueprint $table) {
                $table->dropConstrainedForeignId('owner_id');
            });
        }
    }
};
