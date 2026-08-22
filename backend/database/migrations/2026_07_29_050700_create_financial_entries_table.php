<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_entries', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense', 'loan']);
            $table->string('category')->nullable();
            $table->decimal('amount', 10, 2);
            $table->date('entry_date');
            $table->text('description')->nullable();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('cascade');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_entries');
    }
};
