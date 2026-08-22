<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Module 3 — Advance booking daily cash receipt recording (prompt.md).
 * DRAFT — aligned to existing booking payload; replace if client schema differs.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_cash_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->string('receipt_number')->unique();
            $table->string('tenant_name');
            $table->decimal('amount', 12, 2);
            $table->date('receipt_date');
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['unit_id', 'receipt_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_cash_receipts');
    }
};
