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
        if (Schema::hasTable('units') && !Schema::hasColumn('units', 'monthly_service_charge')) {
            Schema::table('units', function (Blueprint $table) {
                $table->decimal('monthly_service_charge', 12, 2)->default(0.00)->after('price');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('units') && Schema::hasColumn('units', 'monthly_service_charge')) {
            Schema::table('units', function (Blueprint $table) {
                $table->dropColumn('monthly_service_charge');
            });
        }
    }
};
