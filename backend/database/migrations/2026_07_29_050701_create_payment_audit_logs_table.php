<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ledger_id')->nullable()->constrained('rent_ledger')->onDelete('set null');
            $table->string('action'); // deleted, modified
            $table->text('reason');
            $table->foreignId('performed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->json('snapshot')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_audit_logs');
    }
};
