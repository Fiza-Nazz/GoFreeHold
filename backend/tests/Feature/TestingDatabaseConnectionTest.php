<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TestingDatabaseConnectionTest extends TestCase
{
    public function test_phpunit_runs_against_dedicated_mariadb_database(): void
    {
        $row = DB::selectOne('SELECT DATABASE() AS db, VERSION() AS version, @@port AS port');

        $this->assertSame('gofreehold_phpunit', $row->db);
        $this->assertStringContainsString('MariaDB', $row->version);
        $this->assertSame(3306, (int) $row->port);
    }
}
