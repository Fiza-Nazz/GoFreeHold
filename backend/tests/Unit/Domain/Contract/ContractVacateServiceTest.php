<?php

namespace Tests\Unit\Domain\Contract;

use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Services\ContractVacateService;
use App\Domain\Property\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContractVacateServiceTest extends TestCase
{
    use RefreshDatabase;

    private ContractVacateService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ContractVacateService::class);
    }

    public function test_vacate_sets_contract_status_to_vacated(): void
    {
        $unit     = Unit::factory()->occupied()->create();
        $contract = Contract::factory()->for($unit)->active()->create();

        $this->service->vacate($contract, 'Lease ended');

        $this->assertDatabaseHas('contracts', [
            'id'     => $contract->id,
            'status' => 'vacated',
            'notes'  => 'Lease ended',
        ]);
    }

    public function test_vacate_frees_the_linked_unit(): void
    {
        $unit     = Unit::factory()->occupied()->create();
        $contract = Contract::factory()->for($unit)->active()->create();

        $this->service->vacate($contract);

        $this->assertDatabaseHas('units', [
            'id'     => $unit->id,
            'status' => 'AVAILABLE',
        ]);
    }
}
