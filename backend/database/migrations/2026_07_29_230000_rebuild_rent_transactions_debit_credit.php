<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Step 6 — Rebuild rent_transactions to real double-entry schema:
 * contract_id, date, description, debit, credit
 *
 * Existing draft rows (month_year/due_amount/paid_amount/balance) are converted:
 *   due_amount  → one debit row
 *   paid_amount → one credit row (if > 0)
 *
 * Also re-points payment_audit_logs.ledger_id FK onto the new table.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── Recovery path: partial previous run left both tables ──────────
        if (Schema::hasTable('rent_transactions_old') && Schema::hasColumn('rent_transactions', 'debit')) {
            $this->dropAuditLedgerFk();
            Schema::dropIfExists('rent_transactions_old');
            $this->addAuditLedgerFk();
            return;
        }

        if (Schema::hasColumn('rent_transactions', 'debit') && !Schema::hasColumn('rent_transactions', 'month_year')) {
            // Already on real schema
            $this->ensureAuditLedgerFk();
            return;
        }

        $old = DB::table('rent_transactions')->get();

        $this->dropAuditLedgerFk();

        Schema::rename('rent_transactions', 'rent_transactions_old');

        Schema::create('rent_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->date('date');
            $table->string('description')->nullable();
            $table->decimal('debit', 12, 2)->default(0);  // amounts owed (rent due)
            $table->decimal('credit', 12, 2)->default(0); // amounts received (payments)
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->string('deletion_reason')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['contract_id', 'date']);
        });

        foreach ($old as $row) {
            $date = null;
            if (!empty($row->month_year)) {
                try {
                    $date = $row->month_year . '-01';
                } catch (\Throwable $e) {
                    $date = null;
                }
            }
            if (!$date && !empty($row->posted_at)) {
                $date = substr((string) $row->posted_at, 0, 10);
            }
            $date = $date ?: now()->toDateString();

            $due = (float) ($row->due_amount ?? 0);
            $paid = (float) ($row->paid_amount ?? 0);

            // Already-converted rows (if re-run ever sees debit/credit on old snapshot)
            if (isset($row->debit) || isset($row->credit)) {
                DB::table('rent_transactions')->insert([
                    'contract_id' => $row->contract_id,
                    'date'        => $row->date ?? $date,
                    'description' => $row->description ?? null,
                    'debit'       => (float) ($row->debit ?? 0),
                    'credit'      => (float) ($row->credit ?? 0),
                    'deleted_at'  => $row->deleted_at ?? null,
                    'deleted_by'  => $row->deleted_by ?? null,
                    'deletion_reason' => $row->deletion_reason ?? null,
                    'created_at'  => $row->created_at ?? now(),
                    'updated_at'  => $row->updated_at ?? now(),
                ]);
                continue;
            }

            if ($due > 0) {
                DB::table('rent_transactions')->insert([
                    'contract_id' => $row->contract_id,
                    'date'        => $date,
                    'description' => 'Rent due ' . ($row->month_year ?? $date),
                    'debit'       => $due,
                    'credit'      => 0,
                    'deleted_at'  => $row->deleted_at ?? null,
                    'deleted_by'  => $row->deleted_by ?? null,
                    'deletion_reason' => $row->deletion_reason ?? null,
                    'created_at'  => $row->created_at ?? now(),
                    'updated_at'  => $row->updated_at ?? now(),
                ]);
            }

            if ($paid > 0) {
                DB::table('rent_transactions')->insert([
                    'contract_id' => $row->contract_id,
                    'date'        => $date,
                    'description' => 'Rent payment ' . ($row->month_year ?? $date),
                    'debit'       => 0,
                    'credit'      => $paid,
                    'deleted_at'  => $row->deleted_at ?? null,
                    'deleted_by'  => $row->deleted_by ?? null,
                    'deletion_reason' => $row->deletion_reason ?? null,
                    'created_at'  => $row->created_at ?? now(),
                    'updated_at'  => $row->updated_at ?? now(),
                ]);
            }
        }

        Schema::dropIfExists('rent_transactions_old');
        $this->addAuditLedgerFk();
    }

    public function down(): void
    {
        // Irreversible reshape — restore via migrate:fresh if needed.
    }

    private function dropAuditLedgerFk(): void
    {
        if (!Schema::hasTable('payment_audit_logs')) {
            return;
        }
        try {
            Schema::table('payment_audit_logs', function (Blueprint $table) {
                $table->dropForeign(['ledger_id']);
            });
        } catch (\Throwable $e) {
            // FK may already be gone
        }
    }

    private function addAuditLedgerFk(): void
    {
        if (!Schema::hasTable('payment_audit_logs')) {
            return;
        }
        Schema::table('payment_audit_logs', function (Blueprint $table) {
            $table->foreign('ledger_id')->references('id')->on('rent_transactions')->nullOnDelete();
        });
    }

    private function ensureAuditLedgerFk(): void
    {
        $this->dropAuditLedgerFk();
        $this->addAuditLedgerFk();
    }
};
