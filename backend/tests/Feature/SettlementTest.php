<?php

namespace Tests\Feature;

use App\Domain\Contract\Models\Contract;
use App\Domain\Property\Models\Unit;
use App\Domain\Settlement\Models\Settlement;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettlementTest extends TestCase
{
    use RefreshDatabase;

    public function test_completing_settlement_vacates_contract_and_frees_unit(): void
    {
        $admin    = $this->adminUser();
        $unit     = Unit::factory()->occupied()->create();
        $contract = Contract::factory()->for($unit)->active()->create();

        $settlementData = [
            'contract_id' => $contract->id,
            'owner_id'    => $contract->owner_id,
            'vacant_date' => Carbon::now()->toDateString(),
            'dues'        => 500,
            'receivable'  => 100,
            'status'      => 'completed',
        ];

        $response = $this->actingAs($admin)->postJson('/api/admin/settlements', $settlementData);
        $response->assertStatus(201);
        $settlementId = $response->json('data.settlement.id');

        $this->assertDatabaseHas('settlements', [
            'id'     => $settlementId,
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('units', [
            'id'     => $unit->id,
            'status' => 'AVAILABLE',
        ]);

        $this->assertDatabaseHas('contracts', [
            'id'     => $contract->id,
            'status' => 'vacated',
        ]);
    }

    public function test_pending_settlement_does_not_vacate_contract(): void
    {
        $admin    = $this->adminUser();
        $unit     = Unit::factory()->occupied()->create();
        $contract = Contract::factory()->for($unit)->active()->create();

        $this->actingAs($admin)->postJson('/api/admin/settlements', [
            'contract_id' => $contract->id,
            'owner_id'    => $contract->owner_id,
            'vacant_date' => now()->toDateString(),
            'dues'        => 0,
            'receivable'  => 0,
            'status'      => 'pending',
        ])->assertStatus(201);

        $this->assertDatabaseHas('units', [
            'id'     => $unit->id,
            'status' => 'OCCUPIED',
        ]);
    }
}
