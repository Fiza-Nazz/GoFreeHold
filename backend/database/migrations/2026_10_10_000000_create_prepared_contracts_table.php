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
        if (Schema::hasTable('prepared_contracts')) {
            return;
        }

        Schema::create('prepared_contracts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('unit_id')->nullable()->index();
            $table->unsignedBigInteger('tenant_id')->nullable()->index();
            $table->unsignedBigInteger('owner_id')->nullable()->index();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('rent_amount', 15, 2)->default(0);
            $table->decimal('contract_value', 15, 2)->nullable();
            $table->decimal('security_deposit', 15, 2)->nullable();
            $table->string('lease_term')->nullable();
            $table->string('payment_frequency')->nullable();
            $table->string('mode_of_payment')->nullable();
            $table->integer('number_of_cheques')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('draft')->index();
            $table->json('addendum_terms')->nullable();
            $table->json('pdc_cheques')->nullable();
            $table->json('new_tenant_details')->nullable();
            $table->json('tenant_documents')->nullable();
            $table->string('passport_image')->nullable();
            $table->string('visa_page')->nullable();
            $table->string('tenant_id_image')->nullable();
            $table->string('tenant_id_back_image')->nullable();
            $table->timestamps();

            if (Schema::hasTable('units')) {
                $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
            }
            if (Schema::hasTable('tenants')) {
                $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
            }
            if (Schema::hasTable('owners')) {
                $table->foreign('owner_id')->references('id')->on('owners')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prepared_contracts');
    }
};
