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
        // 1. Update complaints table: add category, created_by, source, ensure tenant_id can be null
        Schema::table('complaints', function (Blueprint $table) {
            if (!Schema::hasColumn('complaints', 'category')) {
                $table->string('category', 100)->nullable()->after('description');
            }
            if (!Schema::hasColumn('complaints', 'created_by')) {
                $table->unsignedBigInteger('created_by')->nullable()->after('assigned_to');
                $table->foreign('created_by', 'complaints_created_by_foreign')
                    ->references('id')->on('users')
                    ->nullOnDelete();
            }
            if (!Schema::hasColumn('complaints', 'source')) {
                $table->string('source', 20)->default('tenant')->after('created_by');
            }
        });

        // 2. Create complaint_attachments table
        if (!Schema::hasTable('complaint_attachments')) {
            Schema::create('complaint_attachments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('complaint_id');
                $table->string('file_path', 500);
                $table->string('file_name', 255)->nullable();
                $table->string('mime_type', 100)->nullable();
                $table->unsignedInteger('file_size')->nullable();
                $table->unsignedBigInteger('uploaded_by')->nullable();
                $table->timestamps();

                $table->foreign('complaint_id', 'complaint_attachments_complaint_id_foreign')
                    ->references('id')->on('complaints')
                    ->cascadeOnDelete();
                $table->foreign('uploaded_by', 'complaint_attachments_uploaded_by_foreign')
                    ->references('id')->on('users')
                    ->nullOnDelete();
            });
        }

        // 3. Create complaint_updates table
        if (!Schema::hasTable('complaint_updates')) {
            Schema::create('complaint_updates', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('complaint_id');
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('from_status', 50)->nullable();
                $table->string('to_status', 50)->nullable();
                $table->text('note')->nullable();
                $table->timestamps();

                $table->foreign('complaint_id', 'complaint_updates_complaint_id_foreign')
                    ->references('id')->on('complaints')
                    ->cascadeOnDelete();
                $table->foreign('user_id', 'complaint_updates_user_id_foreign')
                    ->references('id')->on('users')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_updates');
        Schema::dropIfExists('complaint_attachments');

        Schema::table('complaints', function (Blueprint $table) {
            if (Schema::hasColumn('complaints', 'created_by')) {
                $table->dropForeign('complaints_created_by_foreign');
                $table->dropColumn('created_by');
            }
            if (Schema::hasColumn('complaints', 'category')) {
                $table->dropColumn('category');
            }
            if (Schema::hasColumn('complaints', 'source')) {
                $table->dropColumn('source');
            }
        });
    }
};
