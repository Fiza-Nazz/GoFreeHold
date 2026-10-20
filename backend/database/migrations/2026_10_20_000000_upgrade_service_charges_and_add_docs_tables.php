<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Extend units with quarterly and yearly estimate columns
        if (Schema::hasTable('units')) {
            Schema::table('units', function (Blueprint $table) {
                if (!Schema::hasColumn('units', 'quarterly_service_charge')) {
                    $table->decimal('quarterly_service_charge', 12, 2)->nullable()->after('monthly_service_charge');
                }
                if (!Schema::hasColumn('units', 'yearly_service_charge')) {
                    $table->decimal('yearly_service_charge', 12, 2)->nullable()->after('quarterly_service_charge');
                }
            });
        }

        // 2. Upgrade service_charges with org-scoping, period, vendor, and accounting columns
        if (Schema::hasTable('service_charges')) {
            // First alter contract_id to nullable and change status to string
            try {
                DB::statement('ALTER TABLE service_charges MODIFY contract_id BIGINT UNSIGNED NULL');
            } catch (\Throwable $e) {
                // Ignore if already nullable or engine restriction
            }

            try {
                DB::statement("ALTER TABLE service_charges MODIFY status VARCHAR(20) NOT NULL DEFAULT 'pending'");
            } catch (\Throwable $e) {
                // Ignore
            }

            try {
                DB::statement('ALTER TABLE service_charges MODIFY amount DECIMAL(12,2) NOT NULL');
            } catch (\Throwable $e) {
                // Ignore
            }

            Schema::table('service_charges', function (Blueprint $table) {
                if (!Schema::hasColumn('service_charges', 'organization_id')) {
                    $table->unsignedBigInteger('organization_id')->default(1)->after('id');
                }
                if (!Schema::hasColumn('service_charges', 'owner_id')) {
                    $table->unsignedBigInteger('owner_id')->nullable()->after('organization_id');
                }
                if (!Schema::hasColumn('service_charges', 'property_id')) {
                    $table->unsignedBigInteger('property_id')->nullable()->after('owner_id');
                }
                if (!Schema::hasColumn('service_charges', 'period_label')) {
                    $table->string('period_label', 50)->nullable()->after('charge_type');
                }
                if (!Schema::hasColumn('service_charges', 'period_start')) {
                    $table->date('period_start')->nullable()->after('period_label');
                }
                if (!Schema::hasColumn('service_charges', 'period_end')) {
                    $table->date('period_end')->nullable()->after('period_start');
                }
                if (!Schema::hasColumn('service_charges', 'invoice_number')) {
                    $table->string('invoice_number', 100)->nullable()->after('notes');
                }
                if (!Schema::hasColumn('service_charges', 'vendor_name')) {
                    $table->string('vendor_name', 255)->nullable()->after('invoice_number');
                }
                if (!Schema::hasColumn('service_charges', 'ac_transaction_id')) {
                    $table->unsignedBigInteger('ac_transaction_id')->nullable()->after('vendor_name');
                }
                if (!Schema::hasColumn('service_charges', 'created_by')) {
                    $table->unsignedBigInteger('created_by')->nullable()->after('ac_transaction_id');
                }
            });

            // Add indexes safely
            try {
                Schema::table('service_charges', function (Blueprint $table) {
                    $table->index(['organization_id', 'status'], 'idx_sc_org_status');
                });
            } catch (\Throwable $e) {}

            try {
                Schema::table('service_charges', function (Blueprint $table) {
                    $table->index('property_id', 'idx_sc_property_id');
                });
            } catch (\Throwable $e) {}

            try {
                Schema::table('service_charges', function (Blueprint $table) {
                    $table->index('owner_id', 'idx_sc_owner_id');
                });
            } catch (\Throwable $e) {}

            try {
                Schema::table('service_charges', function (Blueprint $table) {
                    $table->index('due_date', 'idx_sc_due_date');
                });
            } catch (\Throwable $e) {}

            // Backfill organization_id, owner_id, property_id from units where missing
            try {
                DB::statement("
                    UPDATE service_charges sc
                    INNER JOIN units u ON sc.unit_id = u.id
                    SET 
                        sc.organization_id = COALESCE(u.organization_id, 1),
                        sc.property_id = COALESCE(sc.property_id, u.property_id),
                        sc.owner_id = COALESCE(sc.owner_id, u.owner_id)
                    WHERE sc.property_id IS NULL OR sc.owner_id IS NULL
                ");
            } catch (\Throwable $e) {}
        }

        // 3. Upgrade service_charge_payments table
        if (Schema::hasTable('service_charge_payments')) {
            Schema::table('service_charge_payments', function (Blueprint $table) {
                if (!Schema::hasColumn('service_charge_payments', 'reference_number')) {
                    $table->string('reference_number', 100)->nullable()->after('payment_method');
                }
                if (!Schema::hasColumn('service_charge_payments', 'remarks')) {
                    $table->text('remarks')->nullable()->after('reference_number');
                }
                if (!Schema::hasColumn('service_charge_payments', 'recorded_by')) {
                    $table->unsignedBigInteger('recorded_by')->nullable()->after('remarks');
                }
                if (!Schema::hasColumn('service_charge_payments', 'payment_id')) {
                    $table->unsignedBigInteger('payment_id')->nullable()->after('recorded_by');
                }
                if (!Schema::hasColumn('service_charge_payments', 'ac_transaction_id')) {
                    $table->unsignedBigInteger('ac_transaction_id')->nullable()->after('payment_id');
                }
            });
        }

        // 4. Create service_charge_docs table
        if (!Schema::hasTable('service_charge_docs')) {
            Schema::create('service_charge_docs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('service_charge_id')
                    ->constrained('service_charges')
                    ->onDelete('cascade');
                $table->string('file_name');
                $table->string('file_path', 500);
                $table->string('mime_type', 100)->nullable();
                $table->unsignedInteger('file_size')->nullable();
                $table->string('doc_type', 50)->default('oa_invoice');
                $table->unsignedBigInteger('uploaded_by')->nullable();
                $table->timestamps();

                $table->index('service_charge_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_charge_docs');

        if (Schema::hasTable('service_charge_payments')) {
            Schema::table('service_charge_payments', function (Blueprint $table) {
                $columns = ['reference_number', 'remarks', 'recorded_by', 'payment_id', 'ac_transaction_id'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('service_charge_payments', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('service_charges')) {
            Schema::table('service_charges', function (Blueprint $table) {
                $columns = [
                    'organization_id', 'owner_id', 'property_id',
                    'period_label', 'period_start', 'period_end',
                    'invoice_number', 'vendor_name', 'ac_transaction_id', 'created_by'
                ];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('service_charges', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('units')) {
            Schema::table('units', function (Blueprint $table) {
                if (Schema::hasColumn('units', 'quarterly_service_charge')) {
                    $table->dropColumn('quarterly_service_charge');
                }
                if (Schema::hasColumn('units', 'yearly_service_charge')) {
                    $table->dropColumn('yearly_service_charge');
                }
            });
        }
    }
};
