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
        if (Schema::hasTable('units') && !Schema::hasColumn('units', 'image')) {
            Schema::table('units', function (Blueprint $table) {
                $table->text('image')->nullable()->after('monthly_service_charge');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('units') && Schema::hasColumn('units', 'image')) {
            Schema::table('units', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }
    }
};
