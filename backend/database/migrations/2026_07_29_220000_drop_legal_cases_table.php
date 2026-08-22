<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Step 5 — Legal case tracking uses contracts.on_case + contract_case_docs
 * (and settlements.on_case). The standalone legal_cases table is removed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('legal_cases');
    }

    public function down(): void
    {
        Schema::create('legal_cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->string('case_number')->nullable();
            $table->string('court')->nullable();
            $table->string('status')->nullable();
            $table->text('notes')->nullable();
            $table->date('filed_date')->nullable();
            $table->string('case_title')->nullable();
            $table->string('case_status')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }
};
