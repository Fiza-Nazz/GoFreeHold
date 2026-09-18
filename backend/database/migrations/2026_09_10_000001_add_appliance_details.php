<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appliances', function (Blueprint $table) {
            $table->date('warranty_expiry')->nullable();
            $table->string('condition', 30)->nullable();
            $table->text('notes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('appliances', function (Blueprint $table) {
            $table->dropColumn(['warranty_expiry', 'condition', 'notes']);
        });
    }
};
