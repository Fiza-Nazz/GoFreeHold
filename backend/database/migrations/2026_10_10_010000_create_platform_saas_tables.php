<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. subscription_plans table
        if (!Schema::hasTable('subscription_plans')) {
            Schema::create('subscription_plans', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->unique();
                $table->decimal('price_monthly', 10, 2)->default(0);
                $table->integer('max_properties')->default(10);
                $table->integer('max_units')->default(50);
                $table->integer('max_users')->default(5);
                $table->json('features')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. organizations table
        if (!Schema::hasTable('organizations')) {
            Schema::create('organizations', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->string('status')->default('trial')->index(); // trial, active, suspended, cancelled
                $table->unsignedBigInteger('plan_id')->nullable()->index();
                $table->unsignedBigInteger('owner_user_id')->nullable()->index();
                $table->timestamp('trial_ends_at')->nullable();
                $table->timestamp('subscribed_at')->nullable();
                $table->timestamp('suspended_at')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 3. subscriptions table
        if (!Schema::hasTable('subscriptions')) {
            Schema::create('subscriptions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('organization_id')->index();
                $table->unsignedBigInteger('plan_id')->nullable()->index();
                $table->string('status')->default('active')->index(); // trial, active, suspended, cancelled
                $table->timestamp('starts_at')->nullable();
                $table->timestamp('ends_at')->nullable();
                $table->timestamps();
            });
        }

        // 4. audit_logs table
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('actor_id')->nullable()->index();
                $table->unsignedBigInteger('organization_id')->nullable()->index();
                $table->string('action')->index();
                $table->string('entity_type')->nullable();
                $table->unsignedBigInteger('entity_id')->nullable();
                $table->string('ip_address')->nullable();
                $table->json('meta')->nullable();
                $table->timestamp('created_at')->nullable()->index();
            });
        }

        // 5. platform_settings table
        if (!Schema::hasTable('platform_settings')) {
            Schema::create('platform_settings', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->json('value')->nullable();
                $table->timestamps();
            });
        }

        // 6. Add organization_id column to business tables
        $businessTables = ['users', 'properties', 'units', 'contracts', 'tenants', 'payments'];
        foreach ($businessTables as $tbl) {
            if (Schema::hasTable($tbl) && !Schema::hasColumn($tbl, 'organization_id')) {
                Schema::table($tbl, function (Blueprint $table) {
                    $table->unsignedBigInteger('organization_id')->nullable()->index();
                });
            }
        }

        // 7. Seed default subscription plans
        $defaultPlans = [
            [
                'id'             => 1,
                'name'           => 'Starter',
                'code'           => 'starter',
                'price_monthly'  => 299.00,
                'max_properties' => 10,
                'max_units'      => 50,
                'max_users'      => 5,
                'features'       => json_encode(['prepared_contracts' => true, 'pdc' => true]),
                'is_active'      => 1,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'id'             => 2,
                'name'           => 'Growth',
                'code'           => 'growth',
                'price_monthly'  => 999.00,
                'max_properties' => 50,
                'max_units'      => 500,
                'max_users'      => 20,
                'features'       => json_encode(['prepared_contracts' => true, 'pdc' => true, 'advanced_reports' => true]),
                'is_active'      => 1,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
            [
                'id'             => 3,
                'name'           => 'Enterprise',
                'code'           => 'enterprise',
                'price_monthly'  => 2499.00,
                'max_properties' => 500,
                'max_units'      => 5000,
                'max_users'      => 100,
                'features'       => json_encode(['prepared_contracts' => true, 'pdc' => true, 'api_access' => true, 'dedicated_support' => true]),
                'is_active'      => 1,
                'created_at'     => now(),
                'updated_at'     => now(),
            ],
        ];

        foreach ($defaultPlans as $p) {
            if (!DB::table('subscription_plans')->where('code', $p['code'])->exists()) {
                DB::table('subscription_plans')->insert($p);
            }
        }

        // 8. Seed default platform settings
        if (!DB::table('platform_settings')->where('key', 'general')->exists()) {
            DB::table('platform_settings')->insert([
                'key'        => 'general',
                'value'      => json_encode([
                    'branding_name'      => 'GoFreeHold',
                    'support_email'      => 'support@gofreehold.com',
                    'default_trial_days' => 14,
                    'feature_flags'      => [
                        'impersonation'      => true,
                        'prepared_contracts' => true,
                        'owner_self_signup'  => true,
                    ],
                    'email_templates'    => new \stdClass(),
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 9. Backfill existing owners into organizations
        if (Schema::hasTable('owners') && Schema::hasTable('users')) {
            $owners = DB::table('owners')->get();
            foreach ($owners as $owner) {
                $ownerUser = DB::table('users')->where('id', $owner->user_id)->first();
                if (!$ownerUser) {
                    continue;
                }

                $orgName = $owner->name ?: ($ownerUser->name ?: 'Customer Org');
                $baseSlug = Str::slug($orgName);
                if (empty($baseSlug)) {
                    $baseSlug = 'org-' . $owner->id;
                }
                $slug = $baseSlug;
                $counter = 1;
                while (DB::table('organizations')->where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . (++$counter);
                }

                $existingOrg = DB::table('organizations')->where('owner_user_id', $ownerUser->id)->first();
                if (!$existingOrg) {
                    $orgId = DB::table('organizations')->insertGetId([
                        'name'          => $orgName,
                        'slug'          => $slug,
                        'status'        => 'active',
                        'plan_id'       => 2, // Growth plan by default
                        'owner_user_id' => $ownerUser->id,
                        'subscribed_at' => now(),
                        'notes'         => 'Backfilled from existing owner profile #' . $owner->id,
                        'created_at'    => now(),
                        'updated_at'    => now(),
                    ]);

                    // Create subscription
                    DB::table('subscriptions')->insert([
                        'organization_id' => $orgId,
                        'plan_id'         => 2,
                        'status'          => 'active',
                        'starts_at'       => now(),
                        'ends_at'         => now()->addYear(),
                        'created_at'      => now(),
                        'updated_at'      => now(),
                    ]);
                } else {
                    $orgId = $existingOrg->id;
                }

                // Link owner user
                DB::table('users')->where('id', $ownerUser->id)->update(['organization_id' => $orgId]);

                // Link owner staff
                if (Schema::hasTable('owner_staff')) {
                    $staffUserIds = DB::table('owner_staff')->where('owner_id', $owner->id)->pluck('user_id');
                    if ($staffUserIds->isNotEmpty()) {
                        DB::table('users')->whereIn('id', $staffUserIds)->update(['organization_id' => $orgId]);
                    }
                }

                // Link properties, units, contracts
                if (Schema::hasTable('properties')) {
                    DB::table('properties')->where('owner_id', $owner->id)->update(['organization_id' => $orgId]);
                }
                if (Schema::hasTable('units')) {
                    DB::table('units')->where('owner_id', $owner->id)->update(['organization_id' => $orgId]);
                }
                if (Schema::hasTable('contracts')) {
                    DB::table('contracts')->where('owner_id', $owner->id)->update(['organization_id' => $orgId]);
                }
                if (Schema::hasTable('tenants')) {
                    DB::table('tenants')->where('owner_id', $owner->id)->update(['organization_id' => $orgId]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('organizations');
        Schema::dropIfExists('subscription_plans');
        Schema::dropIfExists('platform_settings');

        $businessTables = ['users', 'properties', 'units', 'contracts', 'tenants', 'payments'];
        foreach ($businessTables as $tbl) {
            if (Schema::hasTable($tbl) && Schema::hasColumn($tbl, 'organization_id')) {
                Schema::table($tbl, function (Blueprint $table) {
                    $table->dropColumn('organization_id');
                });
            }
        }
    }
};
