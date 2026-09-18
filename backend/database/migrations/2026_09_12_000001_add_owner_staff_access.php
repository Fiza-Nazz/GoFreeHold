<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (DB::table('owners')->whereNotNull('user_id')->groupBy('user_id')->havingRaw('COUNT(*) > 1')->exists()) {
            throw new RuntimeException('Resolve duplicate owner profiles before RBAC migration.');
        }
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin','maintenance','owner','tenant','cashier','accountant') NOT NULL DEFAULT 'tenant'");
        Schema::table('users', fn (Blueprint $t) => $t->string('account_status', 20)->default('active'));
        Schema::table('owners', fn (Blueprint $t) => $t->unique('user_id', 'owners_user_unique'));
        Schema::create('owner_staff', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained('users')->restrictOnDelete();
            $t->foreignId('owner_id')->constrained('owners')->restrictOnDelete();
            $t->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $t->timestamps();
        });
        Schema::create('staff_invitations', function (Blueprint $t) {
            $t->id();
            $t->foreignId('owner_staff_id')->constrained('owner_staff')->restrictOnDelete();
            $t->string('token_hash', 64)->unique();
            $t->timestamp('expires_at');
            $t->timestamp('accepted_at')->nullable();
            $t->timestamp('revoked_at')->nullable();
            $t->string('delivery_status', 20)->default('pending');
            $t->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $t->timestamps();
        });
        Schema::create('staff_access_audits', function (Blueprint $t) {
            $t->id();
            $t->foreignId('actor_id')->constrained('users')->restrictOnDelete();
            $t->foreignId('owner_id')->constrained('owners')->restrictOnDelete();
            $t->string('action', 80);
            $t->unsignedBigInteger('target_id');
            $t->json('details')->nullable();
            $t->timestamps();
        });
        Schema::create('staff_payment_requests', function (Blueprint $t) {
            $t->id();
            $t->foreignId('actor_id')->constrained('users')->restrictOnDelete();
            $t->string('request_key', 64);
            $t->string('payload_hash', 64);
            $t->foreignId('payment_id')->constrained('payments')->restrictOnDelete();
            $t->unique(['actor_id', 'request_key']);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        throw new RuntimeException('RBAC rollback requires a reviewed forward migration to preserve staff and payment history.');
    }
};
