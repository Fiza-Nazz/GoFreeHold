<?php

namespace Tests;

use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();
        // Runs before Laravel invokes RefreshDatabase/DatabaseTransactions traits.
        $connection = $app['db']->connection();
        if ($connection->getDriverName() !== 'mysql'
            || $connection->getDatabaseName() !== 'gofreehold_phpunit'
            || $connection->selectOne('SELECT DATABASE() AS db')->db !== 'gofreehold_phpunit') {
            throw new \RuntimeException('Refusing test setup outside gofreehold_phpunit.');
        }
        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->assertUsingPhpunitDatabase();

        Factory::guessFactoryNamesUsing(function (string $modelName) {
            return 'Database\\Factories\\' . class_basename($modelName) . 'Factory';
        });
    }

    protected function beforeRefreshingDatabase()
    {
        $this->assertUsingPhpunitDatabase();
    }

    private function assertUsingPhpunitDatabase(): void
    {
        $this->assertSame('mysql', config('database.default'));
        $this->assertSame('gofreehold_phpunit', config('database.connections.mysql.database'));
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
        $user = User::factory()->create(['role' => 'maintenance']);
        $owner = \App\Domain\Auth\Models\Owner::factory()->create();
        \App\Domain\Auth\Models\OwnerStaff::create(['user_id' => $user->id, 'owner_id' => $owner->id, 'created_by' => $owner->user_id]);
        return $user;
    }
}
