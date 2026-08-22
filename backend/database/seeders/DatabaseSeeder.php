<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed one demo user per role for local testing.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Admin User',       'email' => 'admin@gofreehold.com',       'role' => 'admin'],
            ['name' => 'Maintenance User', 'email' => 'maintenance@gofreehold.com', 'role' => 'maintenance'],
            ['name' => 'Owner User',       'email' => 'owner@gofreehold.com',       'role' => 'owner'],
            ['name' => 'Owner One',        'email' => 'owner1@gofreehold.com',      'role' => 'owner'],
            ['name' => 'Owner Two',        'email' => 'owner2@gofreehold.com',      'role' => 'owner'],
            ['name' => 'Tenant User',      'email' => 'tenant@gofreehold.com',      'role' => 'tenant'],
            ['name' => 'Tenant One',       'email' => 'tenant1@gofreehold.com',     'role' => 'tenant'],
        ];

        $password = Hash::make('password');
        foreach ($users as $u) {
            // updateOrCreate refreshes password so stale hashes do not cause 422 login
            User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name'     => $u['name'],
                    'role'     => $u['role'],
                    'password' => $password,
                ]
            );
        }
    }
}
