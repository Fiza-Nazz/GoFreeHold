<?php

namespace Tests\Feature;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Contract\Models\CallLog;
use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Models\ContractCheque;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PdcChequeAndCallLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_pdc_cheques_and_contract_call_logs_workflow(): void
    {
        $admin  = $this->adminUser();
        $owner  = Owner::factory()->create(['name' => 'Nakheel Properties']);
        $unit   = Unit::factory()->create(['status' => 'AVAILABLE']);
        $tenant = Tenant::factory()->create(['name' => 'Eng. Tariq Al Nuaimi']);

        // 1. Create Contract with mode of payment = PDC Cheques
        $contract = Contract::factory()->for($unit)->for($owner)->for($tenant)->active()->create([
            'rent_amount'     => 120000,
            'mode_of_payment' => 'cheque',
            'start_date'      => '2026-09-01',
            'end_date'        => '2027-08-31',
        ]);

        // 2. Add 4 Quarterly PDC Cheques (AED 30,000 each)
        $cheque1Res = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/cheques", [
            'cheque_number' => 'CHQ-9901',
            'bank_name'     => 'Emirates NBD',
            'amount'        => 30000,
            'due_date'      => '2026-09-01',
            'notes'         => 'Quarter 1 Rent Cheque',
        ]);
        $cheque1Res->assertStatus(201);
        $cheque1Id = $cheque1Res->json('data.cheque.id');

        $cheque2Res = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/cheques", [
            'cheque_number' => 'CHQ-9902',
            'bank_name'     => 'Emirates NBD',
            'amount'        => 30000,
            'due_date'      => '2026-12-01',
            'notes'         => 'Quarter 2 Rent Cheque',
        ]);
        $cheque2Res->assertStatus(201);
        $cheque2Id = $cheque2Res->json('data.cheque.id');

        $cheque3Res = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/cheques", [
            'cheque_number' => 'CHQ-9903',
            'bank_name'     => 'Emirates NBD',
            'amount'        => 30000,
            'due_date'      => '2027-03-01',
            'notes'         => 'Quarter 3 Rent Cheque',
        ]);
        $cheque3Res->assertStatus(201);

        $cheque4Res = $this->actingAs($admin)->postJson("/api/admin/contracts/{$contract->id}/cheques", [
            'cheque_number' => 'CHQ-9904',
            'bank_name'     => 'Emirates NBD',
            'amount'        => 30000,
            'due_date'      => '2027-06-01',
            'notes'         => 'Quarter 4 Rent Cheque',
        ]);
        $cheque4Res->assertStatus(201);

        // Verify 4 cheques exist in database
        $this->assertEquals(4, ContractCheque::where('contract_id', $contract->id)->count());

        // 3. List Cheques for this Contract
        $listRes = $this->actingAs($admin)->getJson("/api/admin/contracts/{$contract->id}/cheques");
        $listRes->assertStatus(200);
        $this->assertCount(4, $listRes->json('data.cheques'));

        // 4. Update Cheque 1 to CLEARED
        $clearRes = $this->actingAs($admin)->putJson("/api/admin/contracts/{$contract->id}/cheques/{$cheque1Id}", [
            'status' => 'cleared',
            'notes'  => 'Successfully cleared on 01 Sep 2026',
        ]);
        $clearRes->assertStatus(200);
        $this->assertDatabaseHas('contract_cheques', [
            'id'     => $cheque1Id,
            'status' => 'cleared',
        ]);

        // 5. Update Cheque 2 to BOUNCED
        $bounceRes = $this->actingAs($admin)->putJson("/api/admin/contracts/{$contract->id}/cheques/{$cheque2Id}", [
            'status' => 'bounced',
            'notes'  => 'Insufficient funds in tenant account',
        ]);
        $bounceRes->assertStatus(200);
        $this->assertDatabaseHas('contract_cheques', [
            'id'     => $cheque2Id,
            'status' => 'bounced',
        ]);

        // 6. Generate Cheque PDF Receipt
        $receiptRes = $this->actingAs($admin)->get("/api/admin/contracts/{$contract->id}/cheques/{$cheque1Id}/receipt");
        $receiptRes->assertOk();
        $this->assertEquals('application/pdf', $receiptRes->headers->get('Content-Type'));

        // 7. Add Call Logs to Contract
        $callLog1 = $this->actingAs($admin)->postJson('/api/admin/call-logs', [
            'contract_id' => $contract->id,
            'date'        => '2026-09-02',
            'remark'      => 'Called tenant regarding Quarter 2 PDC cheque bounce notice. Tenant promised settlement via wire transfer.',
        ]);
        $callLog1->assertStatus(201);
        $log1Id = $callLog1->json('data.log.id');

        $callLog2 = $this->actingAs($admin)->postJson('/api/admin/call-logs', [
            'contract_id' => $contract->id,
            'date'        => '2026-09-03',
            'remark'      => 'Follow-up call: Tenant shared bank transfer confirmation receipt for AED 30,000.',
        ]);
        $callLog2->assertStatus(201);

        // 8. List Call Logs for Contract
        $logsList = $this->actingAs($admin)->getJson("/api/admin/call-logs?contract_id={$contract->id}");
        $logsList->assertStatus(200);
        $this->assertCount(2, $logsList->json('data.logs'));
        $this->assertEquals($admin->id, $logsList->json('data.logs.0.logged_by.id'));

        // 9. Delete a Call Log
        $this->actingAs($admin)->deleteJson("/api/admin/call-logs/{$log1Id}")->assertStatus(200);
        $this->assertDatabaseMissing('call_logs', ['id' => $log1Id]);
        $this->assertEquals(1, CallLog::where('contract_id', $contract->id)->count());
    }
}
