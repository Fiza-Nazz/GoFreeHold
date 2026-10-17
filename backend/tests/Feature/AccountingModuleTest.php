<?php

namespace Tests\Feature;

use App\Domain\Accounting\Models\AccountingTransaction;
use App\Domain\Accounting\Models\ChartAccount;
use App\Domain\Accounting\Models\Ledger;
use App\Domain\Accounting\Services\AccountSeeder;
use App\Domain\Accounting\Services\JournalLine;
use App\Domain\Accounting\Services\JournalService;
use App\Domain\Accounting\Services\ReportService;
use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\RentTransaction;
use App\Domain\Platform\Models\Organization;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AccountingModuleTest extends TestCase
{
    use RefreshDatabase;

    private function createOrgAndUser(string $role = 'owner'): array
    {
        $org = Organization::create([
            'name'   => 'Test Org ' . uniqid(),
            'slug'   => 'org-' . uniqid(),
            'status' => 'active',
        ]);

        $user = User::factory()->create([
            'role'            => $role,
            'organization_id' => $org->id,
            'account_status'  => 'active',
        ]);

        $owner = Owner::factory()->create([
            'user_id' => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
        ]);

        app(AccountSeeder::class)->seedForOrganization($org->id);

        return [$org, $user, $owner];
    }

    public function test_post_unbalanced_journal_rejected(): void
    {
        [$org, $user] = $this->createOrgAndUser();
        $seeder = app(AccountSeeder::class);
        $cash = $seeder->getAccountByCode($org->id, '1100');
        $income = $seeder->getAccountByCode($org->id, '4100');

        $this->actingAs($user);

        // Try posting unbalanced entry (1000 Dr vs 900 Cr)
        $payload = [
            'date'        => '2026-10-17',
            'description' => 'Unbalanced test',
            'lines'       => [
                ['chartaccount_id' => $cash->id, 'debit' => 1000, 'credit' => 0],
                ['chartaccount_id' => $income->id, 'debit' => 0, 'credit' => 900],
            ],
        ];

        $response = $this->postJson('/api/owner/accounting/journals', $payload);
        $response->assertStatus(422)
            ->assertJsonValidationErrors('lines');

        $this->assertDatabaseMissing('ac_transactions', [
            'organization_id' => $org->id,
            'description'     => 'Unbalanced test',
        ]);
    }

    public function test_post_to_group_account_rejected(): void
    {
        [$org, $user] = $this->createOrgAndUser();
        $seeder = app(AccountSeeder::class);
        $currentAssetsGroup = $seeder->getAccountByCode($org->id, '1000'); // GROUP
        $income = $seeder->getAccountByCode($org->id, '4100'); // LEDGER

        $this->actingAs($user);

        $payload = [
            'date'        => '2026-10-17',
            'description' => 'Group account test',
            'lines'       => [
                ['chartaccount_id' => $currentAssetsGroup->id, 'debit' => 500, 'credit' => 0],
                ['chartaccount_id' => $income->id, 'debit' => 0, 'credit' => 500],
            ],
        ];

        $response = $this->postJson('/api/owner/accounting/journals', $payload);
        $response->assertStatus(422);
    }

    public function test_rent_charge_and_payment_flow(): void
    {
        [$org, $user, $owner] = $this->createOrgAndUser();
        $this->actingAs($user);

        $property = Property::factory()->create(['owner_id' => $owner->id]);
        $unit = Unit::factory()->create([
            'property_id'     => $property->id,
            'organization_id' => $org->id,
            'owner_id'        => $owner->id,
            'status'          => 'OCCUPIED',
        ]);
        $tenant = Tenant::factory()->create(['user_id' => $user->id]);
        $contract = Contract::factory()->create([
            'unit_id'         => $unit->id,
            'owner_id'        => $owner->id,
            'organization_id' => $org->id,
            'tenant_id'       => $tenant->id,
            'status'          => 'active',
        ]);

        // 1. Post rent charge: 10,000 (Dr Rent Receivable · Cr Rental Income)
        $charge = RentTransaction::create([
            'contract_id' => $contract->id,
            'date'        => '2026-10-01',
            'description' => 'October Rent Charge',
            'debit'       => 10000,
            'credit'      => 0,
        ]);
        app(\App\Domain\Accounting\Services\Posters\RentChargePoster::class)->postCharge($charge);

        $this->assertNotNull($charge->fresh()->ac_transaction_id);

        // Verify P&L shows 10,000 revenue
        $reportService = app(ReportService::class);
        $pnl = $reportService->incomeStatement($org->id, '2026-10-01', '2026-10-31');
        $this->assertEquals(10000.0, $pnl['net_income']);

        // 2. Post rent payment: 10,000 via bank transfer (Dr Bank · Cr Rent Receivable)
        $payment = Payment::create([
            'contract_id'    => $contract->id,
            'tenant_id'      => $tenant->id,
            'type'           => 'rent',
            'mode'           => 'bank_transfer',
            'amount'         => 10000,
            'date'           => '2026-10-05',
            'receipt_number' => 'REC-001',
        ]);
        app(\App\Domain\Accounting\Services\Posters\PaymentPoster::class)->postPayment($payment);

        $this->assertNotNull($payment->fresh()->ac_transaction_id);

        // 3. Verify Trial Balance: Bank +10000, Rent Receivable 0, Rental Income 10000
        $tb = $reportService->trialBalance($org->id, '2026-10-31');
        $this->assertTrue($tb['balanced']);

        $accountsMap = collect($tb['accounts'])->keyBy('code');
        $this->assertEquals(10000.0, $accountsMap['1200']['net_debit']); // Bank
        $this->assertEquals(0.0, $accountsMap['1300']['net_debit']); // Rent Receivable cleared
        $this->assertEquals(10000.0, $accountsMap['4100']['net_credit']); // Rental Income
    }

    public function test_security_deposit_received_is_liability_not_revenue(): void
    {
        [$org, $user, $owner] = $this->createOrgAndUser();
        $this->actingAs($user);

        $property = Property::factory()->create(['owner_id' => $owner->id]);
        $unit = Unit::factory()->create([
            'property_id'     => $property->id,
            'organization_id' => $org->id,
            'owner_id'        => $owner->id,
        ]);
        $tenant = Tenant::factory()->create(['user_id' => $user->id]);
        $contract = Contract::factory()->create([
            'unit_id'         => $unit->id,
            'owner_id'        => $owner->id,
            'organization_id' => $org->id,
            'tenant_id'       => $tenant->id,
        ]);

        $payment = Payment::create([
            'contract_id' => $contract->id,
            'tenant_id'   => $tenant->id,
            'type'        => 'deposit',
            'mode'        => 'cash',
            'amount'      => 5000,
            'date'        => '2026-10-10',
        ]);
        app(\App\Domain\Accounting\Services\Posters\PaymentPoster::class)->postPayment($payment);

        $reportService = app(ReportService::class);

        // P&L Net income MUST be 0
        $pnl = $reportService->incomeStatement($org->id, '2026-10-01', '2026-10-31');
        $this->assertEquals(0.0, $pnl['net_income']);

        // Balance sheet: Cash 5000, Liabilities 5000
        $bs = $reportService->balanceSheet($org->id, '2026-10-31');
        $this->assertTrue($bs['balanced']);
        $this->assertEquals(5000.0, $bs['total_assets']);
        $this->assertEquals(5000.0, $bs['total_liabilities']);
    }

    public function test_reversal_creates_opposite_balanced_journal(): void
    {
        [$org, $user] = $this->createOrgAndUser();
        $this->actingAs($user);

        $seeder = app(AccountSeeder::class);
        $cash = $seeder->getAccountByCode($org->id, '1100');
        $income = $seeder->getAccountByCode($org->id, '4100');

        $journalService = app(JournalService::class);

        // Post original: Dr Cash 2000, Cr Income 2000
        $original = $journalService->post(
            organizationId: $org->id,
            date: '2026-10-15',
            description: 'Original entry',
            lines: [
                new JournalLine((int) $cash->id, '2000.0000', '0'),
                new JournalLine((int) $income->id, '0', '2000.0000'),
            ]
        );

        $response = $this->postJson("/api/owner/accounting/journals/{$original->id}/reverse", [
            'reason' => 'Testing reversal',
        ]);
        $response->assertOk();

        // Check reversal entry exists
        $this->assertDatabaseHas('ac_transactions', [
            'organization_id' => $org->id,
            'source_type'     => 'REVERSAL',
            'source_id'       => $original->id,
        ]);

        // Net TB should be zero
        $reportService = app(ReportService::class);
        $tb = $reportService->trialBalance($org->id, '2026-10-31');
        $accountsMap = collect($tb['accounts'])->keyBy('code');
        $this->assertEquals(0.0, $accountsMap['1100']['net_debit']);
        $this->assertEquals(0.0, $accountsMap['4100']['net_credit']);
    }

    public function test_multi_tenant_organization_isolation(): void
    {
        [$orgA, $userA] = $this->createOrgAndUser();
        [$orgB, $userB] = $this->createOrgAndUser();

        $seeder = app(AccountSeeder::class);
        $cashA = $seeder->getAccountByCode($orgA->id, '1100');
        $incomeA = $seeder->getAccountByCode($orgA->id, '4100');

        $journalService = app(JournalService::class);
        $journalService->post(
            organizationId: $orgA->id,
            date: '2026-10-16',
            description: 'Org A private transaction',
            lines: [
                new JournalLine((int) $cashA->id, '5000.0000', '0'),
                new JournalLine((int) $incomeA->id, '0', '5000.0000'),
            ]
        );

        // User B views journals: should see 0 journals
        $resB = $this->actingAs($userB)->getJson('/api/owner/accounting/journals');
        $resB->assertOk();
        $this->assertCount(0, $resB->json('data.journals'));

        // User B views P&L: should see 0 net income
        $pnlB = $this->actingAs($userB)->getJson('/api/owner/accounting/reports/income-statement');
        $pnlB->assertOk();
        $this->assertEquals(0, $pnlB->json('data.net_income'));
    }

    public function test_chart_accounts_crud_validations(): void
    {
        [$org, $user] = $this->createOrgAndUser();
        $this->actingAs($user);

        // 1. Create custom account
        $res = $this->postJson('/api/owner/accounting/chart-accounts', [
            'code'           => '1150',
            'name'           => 'Petty Cash Box',
            'type'           => 'asset',
            'description'    => 'LEDGER',
            'parent_coa'     => '0',
            'is_cash'        => true,
            'dr_cr'          => 'DR',
        ]);
        $res->assertStatus(201);
        $accId = $res->json('data.account.id');

        // 2. Reject duplicate code in same org
        $dupRes = $this->postJson('/api/owner/accounting/chart-accounts', [
            'code'        => '1150',
            'name'        => 'Duplicate Account',
            'type'        => 'asset',
            'description' => 'LEDGER',
        ]);
        $dupRes->assertStatus(422)->assertJsonValidationErrors('code');

        // 3. Post a transaction to this account
        $seeder = app(AccountSeeder::class);
        $capital = $seeder->getAccountByCode($org->id, '3100');
        app(JournalService::class)->post(
            organizationId: $org->id,
            date: '2026-10-17',
            description: 'Petty cash fund',
            lines: [
                new JournalLine($accId, '1000.0000', '0'),
                new JournalLine((int) $capital->id, '0', '1000.0000'),
            ]
        );

        // 4. Try deleting account with posted lines: should fail
        $delRes = $this->deleteJson("/api/owner/accounting/chart-accounts/{$accId}");
        $delRes->assertStatus(422);

        // 5. Try converting LEDGER to GROUP: should fail
        $updRes = $this->putJson("/api/owner/accounting/chart-accounts/{$accId}", [
            'description' => 'GROUP',
        ]);
        $updRes->assertStatus(422);
    }
}
