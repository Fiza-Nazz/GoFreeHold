<?php

namespace Tests;

use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Factory::guessFactoryNamesUsing(function (string $modelName) {
            return 'Database\\Factories\\' . class_basename($modelName) . 'Factory';
        });
    }

    /**
     * Create and return a User with role=admin.
     * (Paul Step 2.2 — shared helper)
     */
    protected function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    /**
     * Create and return a User with role=tenant.
     */
    protected function tenantUser(): User
    {
        return User::factory()->create(['role' => 'tenant']);
    }

    /**
     * Create and return a User with role=owner.
     */
    protected function ownerUser(): User
    {
        return User::factory()->create(['role' => 'owner']);
    }

    /**
     * Create and return a User with role=maintenance.
     */
    protected function maintenanceUser(): User
    {
        return User::factory()->create(['role' => 'maintenance']);
    }
}
