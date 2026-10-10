<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('tenancy_contracts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Dropped per Paul Brit directive in favor of prepared_contracts table
    }
};
