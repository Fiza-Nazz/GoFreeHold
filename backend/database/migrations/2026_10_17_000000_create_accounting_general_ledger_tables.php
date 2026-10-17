<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. ac_chart_accounts
        if (!Schema::hasTable('ac_chart_accounts')) {
            Schema::create('ac_chart_accounts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
                $table->string('code', 50);
                $table->string('name', 255);
                $table->string('type', 50); // asset, liability, equity, revenue, expense, cogs
                $table->string('account_header', 100)->nullable();
                $table->string('parent_coa', 50)->default('0'); // Parent GROUP id as string, '0' = none
                $table->string('description', 20)->default('LEDGER'); // GROUP or LEDGER
                $table->string('dr_cr', 10)->nullable(); // DR or CR
                $table->boolean('is_cash')->default(false);
                $table->string('status', 20)->default('ACTIVE'); // ACTIVE or INACTIVE
                $table->timestamps();

                $table->unique(['organization_id', 'code'], 'ac_chart_accounts_org_code_unique');
                $table->index(['organization_id', 'type'], 'ac_chart_accounts_org_type_idx');
                $table->index(['organization_id', 'description'], 'ac_chart_accounts_org_desc_idx');
            });
        }

        // 2. ac_transactions
        if (!Schema::hasTable('ac_transactions')) {
            Schema::create('ac_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
                $table->date('date');
                $table->string('description', 500)->default('');
                $table->string('status', 20)->default('COMPLETED'); // PENDING or COMPLETED
                $table->string('source_type', 50)->nullable();
                $table->unsignedBigInteger('source_id')->nullable();
                $table->unsignedBigInteger('owner_id')->nullable();
                $table->unsignedBigInteger('contract_id')->nullable();
                $table->unsignedBigInteger('property_id')->nullable();
                $table->unsignedBigInteger('unit_id')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index(['organization_id', 'date', 'status'], 'ac_trans_org_date_status_idx');
                $table->index(['source_type', 'source_id'], 'ac_trans_source_idx');
                $table->index(['organization_id', 'owner_id'], 'ac_trans_org_owner_idx');
            });
        }

        // 3. ac_ledgers
        if (!Schema::hasTable('ac_ledgers')) {
            Schema::create('ac_ledgers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
                $table->foreignId('trans_id')->constrained('ac_transactions')->cascadeOnDelete();
                $table->foreignId('chartaccount_id')->constrained('ac_chart_accounts')->cascadeOnDelete();
                $table->decimal('debit', 18, 4)->default(0);
                $table->decimal('credit', 18, 4)->default(0);
                $table->timestamp('created_at')->nullable();

                $table->index(['organization_id', 'chartaccount_id'], 'ac_ledgers_org_account_idx');
                $table->index('trans_id', 'ac_ledgers_trans_idx');
            });
        }

        // 4. Source document links: ac_transaction_id
        $sourceTables = [
            'payments',
            'rent_transactions',
            'settlements',
            'settlement_payments',
            'financial_entries',
            'contract_cheques',
        ];

        foreach ($sourceTables as $tableName) {
            if (Schema::hasTable($tableName) && !Schema::hasColumn($tableName, 'ac_transaction_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->unsignedBigInteger('ac_transaction_id')->nullable()->after('id')->index();
                });
            }
        }
    }

    public function down(): void
    {
        $sourceTables = [
            'payments',
            'rent_transactions',
            'settlements',
            'settlement_payments',
            'financial_entries',
            'contract_cheques',
        ];

        foreach ($sourceTables as $tableName) {
            if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'ac_transaction_id')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropIndex(['ac_transaction_id']);
                    $table->dropColumn('ac_transaction_id');
                });
            }
        }

        Schema::dropIfExists('ac_ledgers');
        Schema::dropIfExists('ac_transactions');
        Schema::dropIfExists('ac_chart_accounts');
    }
};
