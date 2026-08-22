<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Step 4 — column-level alignment with the real client schema.
 * Uses raw ALTER for renames (no doctrine/dbal required).
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── tenants ───────────────────────────────────────────────────────
        Schema::table('tenants', function (Blueprint $table) {
            if (!Schema::hasColumn('tenants', 'address')) {
                $table->string('address')->nullable()->after('email');
            }
            if (!Schema::hasColumn('tenants', 'contact')) {
                $table->string('contact')->nullable()->after('address');
            }
        });

        // ── properties ────────────────────────────────────────────────────
        // FLAG: type + total_units are draft extras — kept for existing UI/counts.
        Schema::table('properties', function (Blueprint $table) {
            if (!Schema::hasColumn('properties', 'description')) {
                $table->text('description')->nullable()->after('city');
            }
        });

        // ── units ─────────────────────────────────────────────────────────
        Schema::table('units', function (Blueprint $table) {
            $table->dropForeign(['building_id']);
        });
        DB::statement('ALTER TABLE units CHANGE building_id property_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE units CHANGE unit_number number VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE units CHANGE size_sqft size DECIMAL(12,2) NULL');
        DB::statement('ALTER TABLE units CHANGE rent_amount price DECIMAL(12,2) NOT NULL');
        Schema::table('units', function (Blueprint $table) {
            $table->foreign('property_id')->references('id')->on('properties')->cascadeOnDelete();
            if (!Schema::hasColumn('units', 'dhewa_no')) {
                $table->string('dhewa_no')->nullable()->after('number');
            }
            if (!Schema::hasColumn('units', 'category')) {
                $table->string('category')->nullable()->after('dhewa_no');
            }
            if (!Schema::hasColumn('units', 'furnished')) {
                $table->boolean('furnished')->default(false)->after('size');
            }
        });
        DB::statement("ALTER TABLE units MODIFY COLUMN status ENUM('AVAILABLE','BOOKED','OCCUPIED','SOLD') NOT NULL DEFAULT 'AVAILABLE'");

        // ── contracts ─────────────────────────────────────────────────────
        DB::statement('ALTER TABLE contracts CHANGE deposit_amount security_deposit DECIMAL(12,2) NOT NULL');
        Schema::table('contracts', function (Blueprint $table) {
            if (!Schema::hasColumn('contracts', 'date')) {
                $table->date('date')->nullable()->after('owner_id');
            }
            if (!Schema::hasColumn('contracts', 'lease_term')) {
                $table->string('lease_term')->nullable()->after('rent_amount');
            }
            if (!Schema::hasColumn('contracts', 'due_date')) {
                $table->date('due_date')->nullable()->after('end_date');
            }
            if (!Schema::hasColumn('contracts', 'deposit_type')) {
                $table->string('deposit_type')->nullable()->after('security_deposit');
            }
            if (!Schema::hasColumn('contracts', 'dewa_deposit')) {
                $table->decimal('dewa_deposit', 12, 2)->nullable()->after('deposit_type');
            }
            if (!Schema::hasColumn('contracts', 'due')) {
                $table->decimal('due', 12, 2)->default(0)->after('dewa_deposit');
            }
            if (!Schema::hasColumn('contracts', 'on_case')) {
                $table->boolean('on_case')->default(false)->after('due');
            }
            if (!Schema::hasColumn('contracts', 'tenant_id_image')) {
                $table->string('tenant_id_image')->nullable();
            }
            if (!Schema::hasColumn('contracts', 'owner_id_image')) {
                $table->string('owner_id_image')->nullable();
            }
        });

        // ── call_logs ─────────────────────────────────────────────────────
        Schema::table('call_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('call_logs', 'remark')) {
                $table->text('remark')->nullable()->after('contract_id');
            }
            if (!Schema::hasColumn('call_logs', 'date')) {
                $table->date('date')->nullable()->after('remark');
            }
        });
        DB::statement("UPDATE call_logs SET
            date = COALESCE(call_date, DATE(called_at), date),
            remark = TRIM(CONCAT_WS(' | ',
                NULLIF(subject, ''),
                NULLIF(notes, ''),
                NULLIF(outcome, ''),
                NULLIF(remark, '')
            ))
        ");
        Schema::table('call_logs', function (Blueprint $table) {
            foreach (['call_date', 'subject', 'notes', 'outcome', 'called_at'] as $col) {
                if (Schema::hasColumn('call_logs', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        // ── payments ──────────────────────────────────────────────────────
        DB::statement('ALTER TABLE payments CHANGE payment_date date DATE NOT NULL');
        DB::statement('ALTER TABLE payments CHANGE category type VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE payments CHANGE notes remarks TEXT NULL');
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'due_date')) {
                $table->date('due_date')->nullable()->after('date');
            }
        });

        // ── settlements: owner-centric rebuild ────────────────────────────
        Schema::table('settlements', function (Blueprint $table) {
            $table->dropForeign(['contract_id']);
            $table->dropForeign(['tenant_id']);
        });
        Schema::table('settlements', function (Blueprint $table) {
            $table->dropColumn([
                'contract_id', 'tenant_id', 'move_out_date', 'outstanding_rent',
                'dewa_due', 'damage_deductions', 'other_deductions',
                'deposit_refund', 'final_balance', 'document_path', 'notes',
            ]);
        });
        Schema::table('settlements', function (Blueprint $table) {
            $table->foreignId('owner_id')->nullable()->after('id')->constrained('owners')->nullOnDelete();
            $table->date('vacant_date')->nullable()->after('owner_id');
            $table->decimal('dues', 12, 2)->default(0)->after('vacant_date');
            $table->decimal('receivable', 12, 2)->default(0)->after('dues');
            $table->boolean('on_case')->default(false)->after('status');
        });

        // ── jobs: align missing columns ───────────────────────────────────
        Schema::table('jobs', function (Blueprint $table) {
            if (!Schema::hasColumn('jobs', 'status')) {
                $table->string('status')->default('assigned')->after('assigned_to');
            }
            if (!Schema::hasColumn('jobs', 'assigned_by')) {
                $table->unsignedBigInteger('assigned_by')->nullable()->after('assigned_to');
                $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();
            }
        });
        if (Schema::hasColumn('jobs', 'completed_date') && !Schema::hasColumn('jobs', 'completed_at')) {
            DB::statement('ALTER TABLE jobs CHANGE completed_date completed_at DATETIME NULL');
        }

        // ── complaints: tenant_id → tenants ───────────────────────────────
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
        });
        DB::table('complaints')->update(['tenant_id' => null]);
        DB::statement('ALTER TABLE complaints MODIFY tenant_id BIGINT UNSIGNED NULL');
        Schema::table('complaints', function (Blueprint $table) {
            $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete();
        });
    }

    public function down(): void
    {
        // Irreversible structural realignment — restore via migrate:fresh if needed.
    }
};
