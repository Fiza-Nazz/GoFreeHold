<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * - Link rent_transactions credits back to source payments (for reverse on delete)
 * - Soft-delete support on payments (never silent hard-delete)
 * - Optional payment_id on payment_audit_logs for payment-deletion audits
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rent_transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('rent_transactions', 'payment_id')) {
                $table->foreignId('payment_id')
                    ->nullable()
                    ->after('contract_id')
                    ->constrained('payments')
                    ->nullOnDelete();
            }
        });

        Schema::table('payments', function (Blueprint $table) {
            if (! Schema::hasColumn('payments', 'deleted_at')) {
                $table->softDeletes();
            }
            if (! Schema::hasColumn('payments', 'deleted_by')) {
                $table->unsignedBigInteger('deleted_by')->nullable()->after('recorded_by');
            }
            if (! Schema::hasColumn('payments', 'deletion_reason')) {
                $table->string('deletion_reason')->nullable()->after('deleted_by');
            }
        });

        Schema::table('payment_audit_logs', function (Blueprint $table) {
            if (! Schema::hasColumn('payment_audit_logs', 'payment_id')) {
                $table->unsignedBigInteger('payment_id')->nullable()->after('ledger_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rent_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('rent_transactions', 'payment_id')) {
                $table->dropConstrainedForeignId('payment_id');
            }
        });

        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'deletion_reason')) {
                $table->dropColumn('deletion_reason');
            }
            if (Schema::hasColumn('payments', 'deleted_by')) {
                $table->dropColumn('deleted_by');
            }
            if (Schema::hasColumn('payments', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('payment_audit_logs', function (Blueprint $table) {
            if (Schema::hasColumn('payment_audit_logs', 'payment_id')) {
                $table->dropColumn('payment_id');
            }
        });
    }
};
