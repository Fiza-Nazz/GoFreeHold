<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_charges', function (Blueprint $table) {
            $table->id();
            // FLAG — PENDING CLIENT CONFIRMATION (Step 10):
            // Both contract_id and unit_id FKs are kept intentionally.
            // Client must confirm which ownership link is canonical before either is removed.
            $table->foreignId('contract_id')->constrained('contracts')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->string('charge_type');
            $table->decimal('amount', 10, 2);
            $table->date('due_date')->nullable();
            $table->date('paid_date')->nullable();
            $table->enum('status', ['pending', 'paid', 'waived'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_charges');
    }
};
