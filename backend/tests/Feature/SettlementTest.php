<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\RentTransaction;
use App\Domain\Platform\Models\Organization;
use App\Domain\Property\Models\Unit;
use App\Domain\Settlement\Models\Settlement;
use App\Domain\Settlement\Models\SettlementDoc;
use App\Domain\Settlement\Models\SettlementPayment;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SettlementTest extends TestCase
{
    use RefreshDatabase;

    private function createOwnerWithOrg(string $orgStatus = 'active'): array
    {
        $org = Organization::create([
            'name'   => 'Org ' . uniqid(),
            'slug'   => 'org-' . uniqid(),
            'status' => $orgStatus,
        ]);

        $user = User::factory()->create([
            'role'            => 'owner',
            'organization_id' => $org->id,
            'account_status'  => 'active',
        ]);

        $owner = Owner::factory()->create([
            'user_id' => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
        ]);

        return [$user, $owner, $org];
    }

    private function createContractForOwner($owner, $org, string $status = 'active', $unit = null): Contract
    {
        if (! $unit) {
            $unit = Unit::factory()->occupied()->create([
                'organization_id' => $org->id,
                'owner_id'        => $owner->id,
            ]);
        }

        return Contract::factory()->for($unit)->create([
            'owner_id'        => $owner->id,
            'organization_id' => $org->id,
            'status'          => $status,
        ]);
    }

    /**
     * Scenario 1: Vacate modal: POST settlement then POST vacate
     * Expect: Settlement row created; contract vacated; unit AVAILABLE
     */
    public function test_scenario_1_vacate_modal_post_settlement_then_post_vacate(): void
    {
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $unit = Unit::factory()->occupied()->create(['organization_id' => $org->id, 'owner_id' => $owner->id]);
        $contract = $this->createContractForOwner($owner, $org, 'active', $unit);

        // Step A: POST /api/owner/settlements
        $settlementPayload = [
            'contract_id' => $contract->id,
            'owner_id'    => $owner->id,
            'vacant_date' => '2026-10-12',
            'dues'        => 15000.00,
            'receivable'  => 10000.00,
            'status'      => 'pending',
        ];

        $res1 = $this->actingAs($user)->postJson('/api/owner/settlements', $settlementPayload);
        $res1->assertStatus(201);
        $settlementId = $res1->json('data.settlement.id');
        $this->assertNotNull($settlementId);

        $this->assertDatabaseHas('settlements', [
            'id'          => $settlementId,
            'contract_id' => $contract->id,
            'owner_id'    => $owner->id,
            'status'      => 'pending',
        ]);

        // Step B: POST /api/owner/contracts/{id}/vacate
        $vacatePayload = [
            'notes' => 'Vacated on 2026-10-12 • Move-out settlement created',
        ];
        $res2 = $this->actingAs($user)->postJson("/api/owner/contracts/{$contract->id}/vacate", $vacatePayload);
        $res2->assertOk();

        $this->assertSame('vacated', $contract->fresh()->status);
        $this->assertSame('AVAILABLE', $unit->fresh()->status);
        $this->assertStringContainsString('Vacated on 2026-10-12 • Move-out settlement created', $contract->fresh()->notes);
    }

    /**
     * Scenario 2: Net dues > receivable
     * Expect: Settlement pending; unit still freed after vacate
     */
    public function test_scenario_2_net_dues_greater_than_receivable_keeps_settlement_pending_unit_freed(): void
    {
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $unit = Unit::factory()->occupied()->create(['organization_id' => $org->id, 'owner_id' => $owner->id]);
        $contract = $this->createContractForOwner($owner, $org, 'active', $unit);

        $response = $this->actingAs($user)->postJson('/api/owner/settlements', [
            'contract_id' => $contract->id,
            'owner_id'    => $owner->id,
            'vacant_date' => '2026-10-12',
            'dues'        => 15000.00,
            'receivable'  => 10000.00,
            'status'      => 'pending',
        ]);
        $response->assertStatus(201)
                 ->assertJsonPath('data.settlement.status', 'pending');

        $this->actingAs($user)->postJson("/api/owner/contracts/{$contract->id}/vacate", [
            'notes' => 'Move-out complete',
        ])->assertOk();

        $this->assertSame('pending', Settlement::where('contract_id', $contract->id)->value('status'));
        $this->assertSame('AVAILABLE', $unit->fresh()->status);
    }

    /**
     * Scenario 3: Net dues <= receivable
     * Expect: Settlement completed on create; vacate still succeeds (idempotent)
     */
    public function test_scenario_3_net_dues_less_than_or_equal_receivable_vacate_still_succeeds_idempotent(): void
    {
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $unit = Unit::factory()->occupied()->create(['organization_id' => $org->id, 'owner_id' => $owner->id]);
        $contract = $this->createContractForOwner($owner, $org, 'active', $unit);

        // Create with dues <= receivable -> status completed
        $response = $this->actingAs($user)->postJson('/api/owner/settlements', [
            'contract_id' => $contract->id,
            'owner_id'    => $owner->id,
            'vacant_date' => '2026-10-12',
            'dues'        => 5000.00,
            'receivable'  => 10000.00,
            'status'      => 'completed',
        ]);
        $response->assertStatus(201)->assertJsonPath('data.settlement.status', 'completed');

        // Contract is already vacated and unit available via settlement completion
        $this->assertSame('vacated', $contract->fresh()->status);
        $this->assertSame('AVAILABLE', $unit->fresh()->status);

        // Step B vacate call from modal still succeeds idempotently
        $vacateRes = $this->actingAs($user)->postJson("/api/owner/contracts/{$contract->id}/vacate", [
            'notes' => 'Vacated on 2026-10-12 • Move-out settlement created',
        ]);
        $vacateRes->assertOk();

        $this->assertSame('vacated', $contract->fresh()->status);
        $this->assertSame('AVAILABLE', $unit->fresh()->status);
    }

    /**
     * Scenario 4: Wizard create with status=completed
     * Expect: Settlement + vacate + unit AVAILABLE without separate vacate call
     */
    public function test_scenario_4_wizard_create_with_status_completed_frees_unit_without_separate_vacate(): void
    {
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $unit = Unit::factory()->occupied()->create(['organization_id' => $org->id, 'owner_id' => $owner->id]);
        $contract = $this->createContractForOwner($owner, $org, 'active', $unit);

        $response = $this->actingAs($user)->postJson('/api/owner/settlements', [
            'contract_id' => $contract->id,
            'owner_id'    => $owner->id,
            'vacant_date' => '2026-10-12',
            'dues'        => 2000.00,
            'receivable'  => 5000.00,
            'status'      => 'completed',
            'on_case'     => true,
        ]);
        $response->assertStatus(201)
                 ->assertJsonPath('data.settlement.status', 'completed')
                 ->assertJsonPath('data.settlement.on_case', true);

        $this->assertSame('vacated', $contract->fresh()->status);
        $this->assertSame('AVAILABLE', $unit->fresh()->status);
    }

    /**
     * Scenario 5: PUT settlement -> completed
     * Expect: Contract vacated / unit AVAILABLE if not already
     */
    public function test_scenario_5_put_settlement_completed_vacates_contract_and_frees_unit(): void
    {
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $unit = Unit::factory()->occupied()->create(['organization_id' => $org->id, 'owner_id' => $owner->id]);
        $contract = $this->createContractForOwner($owner, $org, 'active', $unit);

        $settlement = Settlement::factory()->create([
            'contract_id' => $contract->id,
            'owner_id'    => $owner->id,
            'status'      => 'pending',
        ]);
        $this->assertSame('active', $contract->fresh()->status);
        $this->assertSame('OCCUPIED', $unit->fresh()->status);

        $response = $this->actingAs($user)->putJson("/api/owner/settlements/{$settlement->id}", [
            'status' => 'completed',
        ]);
        $response->assertOk()
                 ->assertJsonPath('data.settlement.status', 'completed');

        $this->assertSame('vacated', $contract->fresh()->status);
        $this->assertSame('AVAILABLE', $unit->fresh()->status);
    }

    /**
     * Scenario 6: Double vacate
     * Expect: 422
     */
    public function test_scenario_6_double_vacate_returns_422(): void
    {
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $contract = $this->createContractForOwner($owner, $org, 'active');

        // First vacate call
        $this->actingAs($user)->postJson("/api/owner/contracts/{$contract->id}/vacate", [
            'notes' => 'First vacate',
        ])->assertOk();

        $this->assertSame('vacated', $contract->fresh()->status);

        // Second vacate call -> 422
        $this->actingAs($user)->postJson("/api/owner/contracts/{$contract->id}/vacate", [
            'notes' => 'Second vacate attempt',
        ])->assertStatus(422);
    }

    /**
     * Scenario 7: Upload doc
     * Expect: Row in settlement_docs + file on disk; show includes docs
     */
    public function test_scenario_7_upload_doc_stores_on_disk_and_show_includes_docs(): void
    {
        Storage::fake('local');
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $contract = $this->createContractForOwner($owner, $org);
        $settlement = Settlement::factory()->create(['owner_id' => $owner->id, 'contract_id' => $contract->id]);

        $file = UploadedFile::fake()->create('handover.pdf', 100, 'application/pdf');

        $response = $this->actingAs($user)->post('/api/owner/settlement-docs', [
            'settlement_id' => $settlement->id,
            'file'          => $file,
        ]);
        $response->assertStatus(201)
                 ->assertJsonPath('data.doc.file_name', 'handover.pdf');

        $docPath = $response->json('data.doc.file_path');
        $this->assertNotEmpty($docPath);
        Storage::disk('local')->assertExists($docPath);

        $this->assertDatabaseHas('settlement_docs', [
            'settlement_id' => $settlement->id,
            'file_name'     => 'handover.pdf',
            'file_path'     => $docPath,
        ]);

        // Show endpoint includes docs
        $showRes = $this->actingAs($user)->getJson("/api/owner/settlements/{$settlement->id}");
        $showRes->assertOk()
                ->assertJsonCount(1, 'data.settlement.docs')
                ->assertJsonPath('data.settlement.docs.0.file_name', 'handover.pdf');
    }

    /**
     * Scenario 8: Delete doc
     * Expect: Row + file removed
     */
    public function test_scenario_8_delete_doc_removes_row_and_file(): void
    {
        Storage::fake('local');
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $contract = $this->createContractForOwner($owner, $org);
        $settlement = Settlement::factory()->create(['owner_id' => $owner->id, 'contract_id' => $contract->id]);

        $file = UploadedFile::fake()->create('damage_report.jpg', 50, 'image/jpeg');
        $uploadRes = $this->actingAs($user)->post('/api/owner/settlement-docs', [
            'settlement_id' => $settlement->id,
            'file'          => $file,
        ])->assertStatus(201);

        $docId = $uploadRes->json('data.doc.id');
        $filePath = $uploadRes->json('data.doc.file_path');
        Storage::disk('local')->assertExists($filePath);

        $delRes = $this->actingAs($user)->deleteJson("/api/owner/settlement-docs/{$docId}");
        $delRes->assertOk();

        $this->assertDatabaseMissing('settlement_docs', ['id' => $docId]);
        Storage::disk('local')->assertMissing($filePath);
    }

    /**
     * Scenario 9: Record payment
     * Expect: Row in settlement_payments; show includes payments
     */
    public function test_scenario_9_record_payment_attaches_row_and_show_includes_payments(): void
    {
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $contract = $this->createContractForOwner($owner, $org);
        $settlement = Settlement::factory()->create(['owner_id' => $owner->id, 'contract_id' => $contract->id]);

        $paymentPayload = [
            'settlement_id'  => $settlement->id,
            'amount'         => 5000.00,
            'payment_method' => 'cash',
            'payment_date'   => '2026-10-12',
        ];

        $response = $this->actingAs($user)->postJson('/api/owner/settlement-payments', $paymentPayload);
        $response->assertStatus(201)
                 ->assertJsonPath('data.payment.settlement_id', $settlement->id)
                 ->assertJsonPath('data.payment.amount', 5000)
                 ->assertJsonPath('data.payment.payment_method', 'cash');

        $this->assertDatabaseHas('settlement_payments', [
            'settlement_id'  => $settlement->id,
            'amount'         => 5000.00,
            'payment_method' => 'cash',
        ]);

        // Show endpoint includes payments
        $showRes = $this->actingAs($user)->getJson("/api/owner/settlements/{$settlement->id}");
        $showRes->assertOk()
                ->assertJsonCount(1, 'data.settlement.payments')
                ->assertJsonPath('data.settlement.payments.0.amount', 5000);

        // Standalone list endpoint
        $listRes = $this->actingAs($user)->getJson("/api/owner/settlement-payments?settlement_id={$settlement->id}");
        $listRes->assertOk()
                ->assertJsonCount(1, 'data.payments');
    }

    /**
     * Scenario 10: Cross-org settlement_id
     * Expect: 404 / 422
     */
    public function test_scenario_10_cross_org_settlement_rejected_with_404(): void
    {
        [$userA, $ownerA, $orgA] = $this->createOwnerWithOrg();
        [$userB, $ownerB, $orgB] = $this->createOwnerWithOrg();

        $contractA = $this->createContractForOwner($ownerA, $orgA);
        $settlementA = Settlement::factory()->create([
            'owner_id'    => $ownerA->id,
            'contract_id' => $contractA->id,
            'status'      => 'pending',
        ]);

        // User B attempts to view User A's settlement
        $this->actingAs($userB)->getJson("/api/owner/settlements/{$settlementA->id}")
             ->assertStatus(404);

        // User B attempts to mutate User A's settlement
        $this->actingAs($userB)->putJson("/api/owner/settlements/{$settlementA->id}", [
            'status' => 'completed',
        ])->assertStatus(404);

        // User B attempts to delete User A's settlement
        $this->actingAs($userB)->deleteJson("/api/owner/settlements/{$settlementA->id}")
             ->assertStatus(404);

        // User B attempts to create settlement linking User A's contract
        $this->actingAs($userB)->postJson('/api/owner/settlements', [
            'contract_id' => $contractA->id,
            'vacant_date' => '2026-10-12',
            'dues'        => 1000,
            'receivable'  => 500,
        ])->assertStatus(404);
    }

    /**
     * Scenario 11: Suspended org
     * Expect: 403 ACCOUNT_ACCESS_DENIED
     */
    public function test_scenario_11_suspended_org_returns_403_account_access_denied(): void
    {
        [$user, $owner, $org] = $this->createOwnerWithOrg('suspended');

        $response = $this->actingAs($user)->getJson('/api/owner/settlements');
        $response->assertStatus(403);
    }

    public function test_settlement_list_filters(): void
    {
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $contract1 = $this->createContractForOwner($owner, $org);
        $contract2 = $this->createContractForOwner($owner, $org);

        Settlement::factory()->create([
            'owner_id'    => $owner->id,
            'contract_id' => $contract1->id,
            'status'      => 'pending',
            'on_case'     => true,
            'vacant_date' => '2026-10-01',
        ]);
        Settlement::factory()->create([
            'owner_id'    => $owner->id,
            'contract_id' => $contract2->id,
            'status'      => 'completed',
            'on_case'     => false,
            'vacant_date' => '2026-10-15',
        ]);

        // Filter status=pending
        $resPending = $this->actingAs($user)->getJson('/api/owner/settlements?status=pending');
        $resPending->assertOk()->assertJsonCount(1, 'data.settlements');

        // Filter on_case=1
        $resCase = $this->actingAs($user)->getJson('/api/owner/settlements?on_case=1');
        $resCase->assertOk()->assertJsonCount(1, 'data.settlements');

        // Filter date range
        $resDate = $this->actingAs($user)->getJson('/api/owner/settlements?from=2026-10-10&to=2026-10-20');
        $resDate->assertOk()->assertJsonCount(1, 'data.settlements');
    }

    public function test_settlement_doc_download(): void
    {
        Storage::fake('local');
        [$user, $owner, $org] = $this->createOwnerWithOrg();
        $contract = $this->createContractForOwner($owner, $org);
        $settlement = Settlement::factory()->create(['owner_id' => $owner->id, 'contract_id' => $contract->id]);

        $file = UploadedFile::fake()->create('agreement.pdf', 80, 'application/pdf');
        $uploadRes = $this->actingAs($user)->post('/api/owner/settlement-docs', [
            'settlement_id' => $settlement->id,
            'file'          => $file,
        ])->assertStatus(201);

        $docId = $uploadRes->json('data.doc.id');

        $downloadRes = $this->actingAs($user)->get("/api/owner/settlement-docs/{$docId}/download");
        $downloadRes->assertOk();

        $deleteRes = $this->actingAs($user)->deleteJson("/api/owner/settlement-docs/{$docId}");
        $deleteRes->assertOk();
        $this->assertDatabaseMissing('settlement_docs', ['id' => $docId]);
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
