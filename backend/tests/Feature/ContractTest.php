<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Contract\Models\Contract;
use App\Domain\Property\Models\Unit;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_contract_debits_rent_and_occupies_unit(): void
    {
        $admin  = $this->adminUser();
        $unit   = Unit::factory()->create(['status' => 'AVAILABLE']);
        $owner  = Owner::factory()->create();
        $tenant = Tenant::factory()->create();

        $contractData = [
            'unit_id'          => $unit->id,
            'owner_id'         => $owner->id,
            'tenant_id'        => $tenant->id,
            'start_date'       => Carbon::now()->startOfMonth()->toDateString(),
            'end_date'         => Carbon::now()->addYear()->startOfMonth()->toDateString(),
            'due_date'         => Carbon::now()->startOfMonth()->toDateString(),
            'rent_amount'      => 1500,
            'security_deposit' => 5000,
            'type'             => 'residential',
            'mode_of_payment'  => 'cash',
        ];

        $response = $this->actingAs($admin)->postJson('/api/admin/contracts', $contractData);
        $response->assertStatus(201);
        $contractId = $response->json('data.contract.id');

        $this->assertDatabaseHas('units', [
            'id'     => $unit->id,
            'status' => 'OCCUPIED',
        ]);

        $this->assertDatabaseHas('rent_transactions', [
            'contract_id' => $contractId,
            'debit'       => 1500,
            'credit'      => 0,
        ]);
    }

    public function test_cannot_create_contract_for_occupied_unit(): void
    {
        $admin  = $this->adminUser();
        $unit   = Unit::factory()->occupied()->create();
        $owner  = Owner::factory()->create();
        $tenant = Tenant::factory()->create();

        $this->actingAs($admin)->postJson('/api/admin/contracts', [
            'unit_id'          => $unit->id,
            'owner_id'         => $owner->id,
            'tenant_id'        => $tenant->id,
            'start_date'       => now()->toDateString(),
            'end_date'         => now()->addYear()->toDateString(),
            'rent_amount'      => 2000,
            'security_deposit' => 500,
            'type'             => 'residential',
            'mode_of_payment'  => 'cash',
        ])->assertUnprocessable();
    }

    public function test_vacating_contract_frees_unit(): void
    {
        $admin    = $this->adminUser();
        $unit     = Unit::factory()->occupied()->create();
        $contract = Contract::factory()->for($unit)->active()->create();

        $response = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/vacate", [
            'notes' => 'Tenant left',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('units', [
            'id'     => $unit->id,
            'status' => 'AVAILABLE',
        ]);

        $this->assertDatabaseHas('contracts', [
            'id'     => $contract->id,
            'status' => 'vacated',
        ]);
    }

    public function test_renewing_contract_updates_end_date(): void
    {
        $admin    = $this->adminUser();
        $contract = Contract::factory()->active()->create([
            'end_date'    => now()->toDateString(),
            'rent_amount' => 2000,
        ]);

        $newEndDate = Carbon::now()->addYear()->toDateString();

        $response = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/renew", [
            'new_end_date'    => $newEndDate,
            'new_rent_amount' => 2200,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('contracts', [
            'id'          => $contract->id,
            'status'      => 'active',
            'rent_amount' => 2200,
        ]);
    }

    public function test_contract_pdf_returns_pdf_content_type(): void
    {
        $admin    = $this->adminUser();
        $contract = Contract::factory()->active()->create();

        $this->actingAs($admin)
             ->get("/api/admin/contracts/{$contract->id}/pdf")
             ->assertOk()
             ->assertHeader('Content-Type', 'application/pdf');
    }
}
