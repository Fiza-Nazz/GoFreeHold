<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Re-link settlements to a specific tenancy (contract/unit) for move-out completion.
 * Owner-centric fields remain; contract_id identifies which active lease is closing.
 * Required by product plan: "Automatic unit status update (AVAILABLE) on settlement completion".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settlements', function (Blueprint $table) {
            if (! Schema::hasColumn('settlements', 'contract_id')) {
                $table->foreignId('contract_id')
                    ->nullable()
                    ->after('owner_id')
                    ->constrained('contracts')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('settlements', function (Blueprint $table) {
            if (Schema::hasColumn('settlements', 'contract_id')) {
                $table->dropConstrainedForeignId('contract_id');
            }
        });
    }
};
