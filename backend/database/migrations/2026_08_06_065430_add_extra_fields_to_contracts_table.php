<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (!Schema::hasColumn('contracts', 'mode_of_payment')) {
                $table->string('mode_of_payment')->nullable();
            }
            if (!Schema::hasColumn('contracts', 'contract_value')) {
                $table->decimal('contract_value', 12, 2)->nullable();
            }
            if (!Schema::hasColumn('contracts', 'security_deposit')) {
                $table->decimal('security_deposit', 12, 2)->nullable();
            }
            if (!Schema::hasColumn('contracts', 'passport_image')) {
                $table->string('passport_image')->nullable();
            }
            if (!Schema::hasColumn('contracts', 'visa_page')) {
                $table->string('visa_page')->nullable();
            }
            if (!Schema::hasColumn('contracts', 'tenant_id_back_image')) {
                $table->string('tenant_id_back_image')->nullable();
            }
            if (!Schema::hasColumn('contracts', 'discount_type')) {
                $table->string('discount_type')->nullable();
            }
            if (!Schema::hasColumn('contracts', 'discount_info')) {
                $table->text('discount_info')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn([
                'mode_of_payment',
                'contract_value',
                'security_deposit',
                'passport_image',
                'visa_page',
                'tenant_id_back_image',
                'discount_type',
                'discount_info'
            ]);
        });
    }
};
