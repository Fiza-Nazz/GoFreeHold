<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Helper to drop all foreign keys on a given column for a table.
     */
    private function dropForeignKeysOnColumn(string $table, string $column): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        $database = DB::getDatabaseName();
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = ? 
              AND TABLE_NAME = ? 
              AND COLUMN_NAME = ? 
              AND REFERENCED_TABLE_NAME IS NOT NULL
        ", [$database, $table, $column]);

        foreach ($foreignKeys as $fk) {
            DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$fk->CONSTRAINT_NAME}`");
        }
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Data migration — map owner_id values (users.id) to owners.id
        $tables = ['properties', 'units', 'contracts'];

        foreach ($tables as $tbl) {
            if (!Schema::hasTable($tbl) || !Schema::hasColumn($tbl, 'owner_id')) {
                continue;
            }

            // Find all distinct owner_id values in this table
            $currentOwnerIds = DB::table($tbl)->whereNotNull('owner_id')->distinct()->pluck('owner_id');

            foreach ($currentOwnerIds as $currentId) {
                // If $currentId already exists in owners table, keep it
                $existsInOwners = DB::table('owners')->where('id', $currentId)->exists();
                if ($existsInOwners) {
                    continue;
                }

                // Check if $currentId matches a user in users table
                $user = DB::table('users')->where('id', $currentId)->first();
                if ($user) {
                    // Find or create Owner profile for this user
                    $ownerProfile = DB::table('owners')->where('user_id', $user->id)->first();
                    if (!$ownerProfile) {
                        $ownerId = DB::table('owners')->insertGetId([
                            'user_id'    => $user->id,
                            'name'       => $user->name,
                            'email'      => $user->email,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    } else {
                        $ownerId = $ownerProfile->id;
                    }

                    // Update records in $tbl from user_id to owners.id
                    DB::table($tbl)->where('owner_id', $currentId)->update(['owner_id' => $ownerId]);
                }
            }
        }

        // Step 2: Drop old FK constraints and add new FK constraints pointing to owners(id)
        foreach ($tables as $tbl) {
            $this->dropForeignKeysOnColumn($tbl, 'owner_id');

            if (DB::getDriverName() === 'mysql') {
                Schema::table($tbl, function (Blueprint $table) {
                    $table->foreign('owner_id')->references('id')->on('owners')->onDelete('cascade');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['contracts', 'units', 'properties'];
        foreach ($tables as $tbl) {
            $this->dropForeignKeysOnColumn($tbl, 'owner_id');

            if (DB::getDriverName() === 'mysql') {
                Schema::table($tbl, function (Blueprint $table) {
                    $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
                });
            }
        }
    }
};
