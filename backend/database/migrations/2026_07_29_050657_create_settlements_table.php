<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->date('move_out_date');
            $table->decimal('outstanding_rent', 10, 2)->default(0);
            $table->decimal('dewa_due', 10, 2)->default(0);
            $table->decimal('damage_deductions', 10, 2)->default(0);
            $table->decimal('other_deductions', 10, 2)->default(0);
            $table->decimal('deposit_refund', 10, 2)->default(0);
            $table->decimal('final_balance', 10, 2)->default(0);
            $table->enum('status', ['pending', 'completed'])->default('pending');
            $table->string('document_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settlements');
    }
};
