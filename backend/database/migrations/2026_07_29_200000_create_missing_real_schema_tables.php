<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Step 3 of real-schema alignment: create every real-schema table that had
 * no migration at all. Field lists follow the client's real schema document;
 * where the document names no columns, a minimal conventional design is used
 * and flagged in the accompanying report for client confirmation.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── Section 1: Access & Parties ────────────────────────────────────

        // owners — property owners, linked to users
        Schema::create('owners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('contact')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->timestamps();
        });

        // ── Section 2: Property Inventory ──────────────────────────────────

        // items — appliance catalog (separate from draft appliances/inventory_items)
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('brand')->nullable();
            $table->text('remark')->nullable();
            $table->timestamps();
        });

        // unit_items — exact fields from real schema
        Schema::create('unit_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->integer('qty')->default(1);
            $table->string('serial')->nullable();
            $table->string('warranty')->nullable();
            $table->text('remark')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();
        });

        // item_store — warehouse stock
        Schema::create('item_store', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->integer('qty')->default(0);
            $table->text('remark')->nullable();
            $table->timestamps();
        });

        // purchase_items.item_id now gets its FK (items table exists)
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->foreign('item_id')->references('id')->on('items')->nullOnDelete();
        });

        // ── Section 3: Leasing ─────────────────────────────────────────────

        // tenancy_res — UAE residential tenancy form (owner/property/tenant/rent/period)
        Schema::create('tenancy_res', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            // Owner section
            $table->string('owner_name')->nullable();
            $table->string('lessor_name')->nullable();
            $table->string('lessor_emirates_id')->nullable();
            $table->string('lessor_license_no')->nullable();
            $table->string('lessor_email')->nullable();
            $table->string('lessor_phone')->nullable();
            // Tenant section
            $table->string('tenant_name')->nullable();
            $table->string('tenant_emirates_id')->nullable();
            $table->string('tenant_license_no')->nullable();
            $table->string('tenant_email')->nullable();
            $table->string('tenant_phone')->nullable();
            // Property section
            $table->string('plot_no')->nullable();
            $table->string('property_name')->nullable();
            $table->string('property_usage')->nullable(); // residential/commercial/industrial
            $table->string('property_area')->nullable();
            $table->string('premises_no')->nullable();    // DEWA
            $table->string('property_type')->nullable();
            $table->string('location')->nullable();
            // Rent / period section
            $table->decimal('annual_rent', 12, 2)->nullable();
            $table->date('period_from')->nullable();
            $table->date('period_to')->nullable();
            $table->decimal('security_deposit', 12, 2)->nullable();
            $table->string('mode_of_payment')->nullable();
            $table->timestamps();
        });

        // tenancy_contracts — addendum clauses c1..c8
        Schema::create('tenancy_contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            for ($i = 1; $i <= 8; $i++) {
                $table->text('c' . $i)->nullable();
            }
            $table->timestamps();
        });

        // terms — terms & conditions, linked to contract via cid
        Schema::create('terms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cid')->constrained('contracts')->cascadeOnDelete(); // contract id (real schema calls it cid)
            $table->text('terms')->nullable();
            $table->timestamps();
        });

        // contract_docs — general contract file attachments
        Schema::create('contract_docs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->timestamps();
        });

        // contract_case_docs — legal case files (replaces standalone legal_cases; see Step 5)
        Schema::create('contract_case_docs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->timestamps();
        });

        // ── Section 4: Money / Ledger ──────────────────────────────────────

        // contract_payables — amounts owed on contract
        Schema::create('contract_payables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->string('description')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->string('status')->default('pending'); // pending, paid
            $table->timestamps();
        });

        // settlement_docs
        Schema::create('settlement_docs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('settlement_id')->constrained('settlements')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path')->nullable();
            $table->timestamps();
        });

        // settlement_payments — exact fields from real schema
        Schema::create('settlement_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('settlement_id')->constrained('settlements')->cascadeOnDelete();
            $table->string('payment_method')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->date('payment_date')->nullable();
            $table->timestamps();
        });

        // service_charge_payments
        Schema::create('service_charge_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_charge_id')->constrained('service_charges')->cascadeOnDelete();
            $table->decimal('amount', 12, 2)->default(0);
            $table->date('payment_date')->nullable();
            $table->string('payment_method')->nullable();
            $table->text('remark')->nullable();
            $table->timestamps();
        });

        // categories — for incomes/expenses (three separate tables per real schema)
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('expense'); // income | expense
            $table->timestamps();
        });

        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->decimal('amount', 12, 2)->default(0);
            $table->date('date')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->decimal('amount', 12, 2)->default(0);
            $table->date('date')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // bank — banking master
        Schema::create('bank', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // bank_accounts
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_id')->nullable()->constrained('bank')->nullOnDelete();
            $table->string('account_name');
            $table->string('account_number')->nullable();
            $table->string('iban')->nullable();
            $table->string('branch')->nullable();
            $table->timestamps();
        });

        // ── Section 6: Maintenance ─────────────────────────────────────────

        // teams — maintenance teams
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->text('remark')->nullable();
            $table->timestamps();
        });

        // jobs.team_id — jobs are now assignable to teams (real schema design)
        Schema::table('jobs', function (Blueprint $table) {
            $table->foreignId('team_id')->nullable()->after('complaint_id')->constrained('teams')->nullOnDelete();
        });

        // maintenance_charges — billable charges
        Schema::create('maintenance_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->nullable()->constrained('jobs')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('description')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('status')->default('pending'); // pending, billed, paid
            $table->timestamps();
        });

        // maintenances — maintenance records
        Schema::create('maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->date('date')->nullable();
            $table->text('description')->nullable();
            $table->decimal('cost', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenances');
        Schema::dropIfExists('maintenance_charges');
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('team_id');
        });
        Schema::dropIfExists('teams');
        Schema::dropIfExists('bank_accounts');
        Schema::dropIfExists('bank');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('incomes');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('service_charge_payments');
        Schema::dropIfExists('settlement_payments');
        Schema::dropIfExists('settlement_docs');
        Schema::dropIfExists('contract_payables');
        Schema::dropIfExists('contract_case_docs');
        Schema::dropIfExists('contract_docs');
        Schema::dropIfExists('terms');
        Schema::dropIfExists('tenancy_contracts');
        Schema::dropIfExists('tenancy_res');
        Schema::table('purchase_items', function (Blueprint $table) {
            $table->dropForeign(['item_id']);
        });
        Schema::dropIfExists('item_store');
        Schema::dropIfExists('unit_items');
        Schema::dropIfExists('items');
        Schema::dropIfExists('owners');
    }
};
