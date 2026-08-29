<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ValidationTest extends TestCase
{
    use RefreshDatabase;

    public static function invalidContractPayloads(): array
    {
        return [
            'missing unit_id'         => [['rent_amount' => 1000]],
            'negative rent'           => [['unit_id' => 1, 'rent_amount' => -1]],
            'end before start'        => [[
                'unit_id'    => 1,
                'start_date' => '2026-06-01',
                'end_date'   => '2025-01-01',
            ]],
            'invalid mode_of_payment' => [['unit_id' => 1, 'mode_of_payment' => 'barter']],
        ];
    }

    #[DataProvider('invalidContractPayloads')]
    public function test_store_contract_validates_input(array $payload): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)
             ->postJson('/api/admin/contracts', $payload)
             ->assertUnprocessable();
    }
}
