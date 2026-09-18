<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;
use App\Domain\Property\Models\Unit;

class ValidationTest extends TestCase
{
    use RefreshDatabase;

    public static function invalidContractPayloads(): array
    {
        return [
            'missing unit_id' => ['unit_id', null],
            'negative rent' => ['rent_amount', -1],
            'end before start' => ['end_date', '2025-01-01'],
            'non-string mode_of_payment' => ['mode_of_payment', ['cash']],
        ];
    }

    #[DataProvider('invalidContractPayloads')]
    public function test_store_contract_validates_input(string $field, mixed $invalidValue): void
    {
        $admin = $this->adminUser();
        $unit = Unit::factory()->create(['status' => 'AVAILABLE']);
        $payload = [
            'unit_id' => $unit->id, 'owner_id' => $unit->owner_id,
            'tenant_name' => 'Validation Tenant', 'start_date' => '2026-06-01',
            'end_date' => '2027-06-01', 'rent_amount' => 1000,
            'security_deposit' => 100, 'type' => 'residential', 'mode_of_payment' => 'cash',
        ];
        $payload[$field] = $invalidValue;

        $this->actingAs($admin)
             ->postJson('/api/admin/contracts', $payload)
             ->assertUnprocessable()
             ->assertJsonValidationErrors([$field])
             ->assertJsonMissingValidationErrors(array_diff(array_keys($payload), [$field]));
        $this->assertDatabaseCount('contracts', 0);
    }
}
