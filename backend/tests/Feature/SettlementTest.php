<?php

namespace Tests\Feature;

use App\Domain\Contract\Models\Contract;
use App\Domain\Property\Models\Unit;
use App\Domain\Payment\Models\RentTransaction;
use App\Domain\Settlement\Models\Settlement;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SettlementTest extends TestCase
{
    use RefreshDatabase;

    public function test_settlement_rejects_a_different_owner_profile(): void
    {
        $contract = Contract::factory()->active()->create();
        $other = \App\Domain\Auth\Models\Owner::factory()->create();
        $this->actingAs($this->adminUser())->postJson('/api/admin/settlements', [
            'contract_id' => $contract->id, 'owner_id' => $other->id,
            'vacant_date' => now()->toDateString(), 'dues' => 0, 'receivable' => 0,
        ])->assertUnprocessable()->assertJsonValidationErrors('owner_id');
        $this->assertDatabaseCount('settlements', 0);
        $this->assertSame('active', $contract->fresh()->status);
    }

    public function test_linked_settlement_cannot_be_moved_to_another_contract(): void
    {
        $contract = Contract::factory()->active()->create();
        $other = Contract::factory()->active()->create();
        $settlement = Settlement::factory()->create([
            'contract_id' => $contract->id, 'owner_id' => $contract->owner_id, 'status' => 'pending',
        ]);
        $this->actingAs($this->adminUser())->putJson('/api/admin/settlements/'.$settlement->id, [
            'contract_id' => $other->id, 'status' => 'completed',
        ])->assertUnprocessable()->assertJsonValidationErrors('contract_id');
        $this->assertSame($contract->id, $settlement->fresh()->contract_id);
        $this->assertSame('pending', $settlement->fresh()->status);
        $this->assertSame('active', $other->fresh()->status);
    }

    public function test_settlement_inherits_owner_profile_id_when_owner_is_omitted(): void
    {
        $admin = $this->adminUser();
        $owner = \App\Domain\Auth\Models\Owner::factory()->create();
        $this->assertNotEquals($owner->id, $owner->user_id);
        $contract = Contract::factory()->active()->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($admin)->postJson('/api/admin/settlements', [
            'contract_id' => $contract->id,
            'vacant_date' => now()->toDateString(),
            'dues' => 0,
            'receivable' => 0,
        ])->assertCreated()->assertJsonPath('data.settlement.owner_id', $owner->id);

        $this->assertDatabaseHas('settlements', [
            'id' => $response->json('data.settlement.id'),
            'contract_id' => $contract->id,
            'owner_id' => $owner->id,
        ]);
        $this->assertDatabaseHas('contracts', ['id' => $contract->id, 'status' => 'active']);
    }

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

    public function test_settlement_document_is_stored_and_linked(): void
    {
        Storage::fake('public');
        $settlement = Settlement::factory()->create();

        $response = $this->actingAs($this->adminUser())->post('/api/admin/settlement-docs', [
            'settlement_id' => $settlement->id,
            'file' => UploadedFile::fake()->create('handover.pdf', 48, 'application/pdf'),
        ]);

        $response->assertCreated()->assertJsonPath('data.doc.file_name', 'handover.pdf');
        $path = $response->json('data.doc.file_path');
        Storage::disk('public')->assertExists($path);
        $this->assertDatabaseHas('settlement_docs', ['settlement_id' => $settlement->id, 'file_path' => $path]);
    }

    public function test_settlement_payment_is_attached_to_settlement(): void
    {
        $settlement = Settlement::factory()->create();

        $this->actingAs($this->adminUser())->postJson('/api/admin/settlement-payments', [
            'settlement_id' => $settlement->id,
            'payment_method' => 'bank_transfer',
            'amount' => 375.25,
            'payment_date' => '2026-09-09',
        ])->assertCreated()
          ->assertJsonPath('data.payment.settlement_id', $settlement->id)
          ->assertJsonPath('data.payment.amount', 375.25);

        $this->assertDatabaseHas('settlement_payments', [
            'settlement_id' => $settlement->id,
            'payment_method' => 'bank_transfer',
            'amount' => 375.25,
        ]);
    }

    public function test_completing_settlement_twice_is_idempotent(): void
    {
        $unit = Unit::factory()->occupied()->create();
        $contract = Contract::factory()->for($unit)->active()->create();
        $settlement = Settlement::factory()->create([
            'contract_id' => $contract->id,
            'owner_id' => $contract->owner_id,
            'status' => 'pending',
        ]);
        $admin = $this->adminUser();

        $this->actingAs($admin)->putJson("/api/admin/settlements/{$settlement->id}", ['status' => 'completed'])->assertOk();
        $this->actingAs($admin)->putJson("/api/admin/settlements/{$settlement->id}", ['status' => 'completed'])->assertOk();

        $this->assertDatabaseCount('settlements', 1);
        $this->assertDatabaseHas('contracts', ['id' => $contract->id, 'status' => 'vacated']);
        $this->assertDatabaseHas('units', ['id' => $unit->id, 'status' => 'AVAILABLE']);
    }

    public function test_receivables_report_categorizes_vacated_contract_as_previous_tenant(): void
    {
        $contract = Contract::factory()->create(['status' => 'vacated']);
        RentTransaction::create([
            'contract_id' => $contract->id, 'date' => now()->toDateString(),
            'description' => 'Move-out balance', 'debit' => 900, 'credit' => 125,
        ]);

        $this->actingAs($this->adminUser())
            ->getJson('/api/admin/receivables/categorized?tenant_type=previous')
            ->assertOk()
            ->assertJsonCount(1, 'data.receivables')
            ->assertJsonPath('data.receivables.0.contract_id', $contract->id)
            ->assertJsonPath('data.receivables.0.tenant_type', 'previous')
            ->assertJsonPath('data.receivables.0.outstanding', 775)
            ->assertJsonPath('data.summary.total_previous', 775)
            ->assertJsonPath('data.summary.total_current', 0);
    }
}
