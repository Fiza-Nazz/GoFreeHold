<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contract_cheques', function (Blueprint $table) {
            $table->string('cheque_number')->nullable()->change();
            $table->string('account_holder_name')->nullable();
            $table->string('payee_name')->nullable();
            $table->string('nature', 30)->nullable();
            $table->string('type', 100)->nullable();
            $table->string('cheque_image_path')->nullable();
            $table->string('cheque_image_name')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('contract_cheques', function (Blueprint $table) {
            $table->dropColumn(['account_holder_name', 'payee_name', 'nature', 'type', 'cheque_image_path', 'cheque_image_name']);
        });
    }
};
