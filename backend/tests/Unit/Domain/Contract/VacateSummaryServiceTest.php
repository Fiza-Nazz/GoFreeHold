<?php

namespace Tests\Unit\Domain\Contract;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Services\VacateSummaryService;
use App\Domain\Payment\Models\ContractPayable;
use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\RentTransaction;
use App\Domain\Payment\Models\ServiceCharge;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VacateSummaryServiceTest extends TestCase
{
    use RefreshDatabase;

    private VacateSummaryService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(VacateSummaryService::class);
    }

    public function test_calculate_produces_accurate_vacate_summary_and_settlement_preview(): void
    {
        $ownerUser = User::factory()->create(['role' => 'owner']);
        $owner = Owner::factory()->create(['user_id' => $ownerUser->id]);
        $property = Property::factory()->create(['owner_id' => $owner->id, 'name' => 'Marina Heights']);
        $unit = Unit::factory()->create([
            'property_id' => $property->id,
            'owner_id'    => $owner->id,
            'number'      => '501',
            'type'        => 'Apartment',
            'status'      => 'OCCUPIED',
        ]);
        $tenantUser = User::factory()->create(['role' => 'tenant']);
        $tenant = Tenant::factory()->create([
            'user_id' => $tenantUser->id,
            'name'    => 'Ali Khan',
            'email'   => 'ali@example.com',
        ]);

        $contract = Contract::create([
            'unit_id'          => $unit->id,
            'tenant_id'        => $tenant->id,
            'owner_id'         => $owner->id,
            'start_date'       => '2026-01-01',
            'end_date'         => '2026-12-31',
            'rent_amount'      => 60000.00,
            'security_deposit' => 5000.00,
            'dewa_deposit'     => 1000.00,
            'lease_term'       => '12 Months',
            'status'           => 'active',
        ]);

        // Post rent dues: one in Jan, one in Feb, one in future (2027-01-01)
        RentTransaction::create([
            'contract_id' => $contract->id,
            'date'        => '2026-01-01',
            'description' => 'Rent Due January',
            'debit'       => 5000.00,
            'credit'      => 0.00,
        ]);
        RentTransaction::create([
            'contract_id' => $contract->id,
            'date'        => '2026-02-01',
            'description' => 'Rent due 2026-02',
            'debit'       => 5000.00,
            'credit'      => 0.00,
        ]);
        RentTransaction::create([
            'contract_id' => $contract->id,
            'date'        => '2027-01-01',
            'description' => 'Rent Due Next Year',
            'debit'       => 5000.00,
            'credit'      => 0.00,
        ]);

        // Unpaid payable and service charge within period
        ContractPayable::create([
            'contract_id' => $contract->id,
            'description' => 'Maintenance Fee',
            'amount'      => 300.00,
            'due_date'    => '2026-03-01',
            'status'      => 'pending',
        ]);
        ServiceCharge::create([
            'contract_id' => $contract->id,
            'unit_id'     => $unit->id,
            'charge_type' => 'utilities',
            'amount'      => 200.00,
            'due_date'    => '2026-03-15',
            'status'      => 'pending',
        ]);

        // Paid payable (should NOT be included in other charges)
        ContractPayable::create([
            'contract_id' => $contract->id,
            'description' => 'Key Replacement (Paid)',
            'amount'      => 150.00,
            'due_date'    => '2026-02-15',
            'status'      => 'paid',
        ]);

        // Payments: Rent payment 8000, DEWA payment 500
        Payment::create([
            'contract_id' => $contract->id,
            'tenant_id'   => $tenant->id,
            'type'        => 'rent',
            'mode'        => 'bank_transfer',
            'amount'      => 8000.00,
            'date'        => '2026-01-05',
        ]);
        Payment::create([
            'contract_id' => $contract->id,
            'tenant_id'   => $tenant->id,
            'type'        => 'dewa',
            'mode'        => 'cash',
            'amount'      => 500.00,
            'date'        => '2026-01-10',
        ]);
        // Payment after cutoff date (2026-06-30 vs 2026-07-01)
        Payment::create([
            'contract_id' => $contract->id,
            'tenant_id'   => $tenant->id,
            'type'        => 'rent',
            'mode'        => 'cash',
            'amount'      => 2000.00,
            'date'        => '2026-07-01',
        ]);

        // Execute calculate as of 2026-06-30
        $result = $this->service->calculate($contract, '2026-06-30');

        // Assert Unit / Contract Info
        $this->assertEquals('2026-06-30', $result['as_of']);
        $this->assertEquals('Ali Khan', $result['tenant']['name']);
        $this->assertEquals('501', $result['unit']['number']);
        $this->assertEquals('Apartment', $result['unit']['type']);
        $this->assertEquals('Marina Heights', $result['property']['name']);
        $this->assertEquals(60000.00, $result['contract']['rent_amount']);

        // Assert Receivables
        // Total rent up to 2026-06-30 = 5000 + 5000 = 10000 (future 5000 excluded)
        $this->assertEquals(10000.00, $result['receivables']['total_rent']);
        $this->assertEquals(0.00, $result['receivables']['total_dewa']);
        // Other charges = 300 (pending payable) + 200 (pending service charge) = 500
        $this->assertEquals(500.00, $result['receivables']['other_charges']);
        $this->assertEquals(250.00, $result['receivables']['admin_charge']);
        $this->assertEquals(0.00, $result['receivables']['extra_fee']);
        // Total receivables = 10000 + 0 + 500 + 250 + 0 = 10750
        $this->assertEquals(10750.00, $result['receivables']['total']);

        // Assert Received
        // Rent paid = 8000 (2000 payment on 2026-07-01 is after as_of)
        $this->assertEquals(8000.00, $result['received']['total_rent_paid']);
        $this->assertEquals(500.00, $result['received']['total_dewa_paid']);
        $this->assertEquals(0.00, $result['received']['other_charges_paid']);
        // Total received = 8000 + 500 + 0 = 8500
        $this->assertEquals(8500.00, $result['received']['total']);

        // Assert Settlement Preview
        // Deposits = 5000 + 1000 = 6000
        $this->assertEquals(6000.00, $result['settlement_preview']['deposits_total']);
        // Formula: Amount Due = (deposits + received_total) - receivables_total
        // = (6000 + 8500) - 10750 = 14500 - 10750 = +3750 (refund to tenant)
        $this->assertEquals(3750.00, $result['settlement_preview']['amount_due']);
        $this->assertEquals('refund', $result['settlement_preview']['status']);

        // Verify read-only: Contract status must STILL be active
        $this->assertEquals('active', $contract->fresh()->status);
        $this->assertEquals('OCCUPIED', $unit->fresh()->status);
    }

    public function test_calculate_negative_amount_due_when_tenant_owes(): void
    {
        $ownerUser = User::factory()->create(['role' => 'owner']);
        $owner = Owner::factory()->create(['user_id' => $ownerUser->id]);
        $property = Property::factory()->create(['owner_id' => $owner->id]);
        $unit = Unit::factory()->create(['property_id' => $property->id, 'owner_id' => $owner->id]);
        $tenantUser = User::factory()->create(['role' => 'tenant']);
        $tenant = Tenant::factory()->create(['user_id' => $tenantUser->id]);

        $contract = Contract::create([
            'unit_id'          => $unit->id,
            'tenant_id'        => $tenant->id,
            'owner_id'         => $owner->id,
            'start_date'       => '2026-01-01',
            'end_date'         => '2026-12-31',
            'rent_amount'      => 60000.00,
            'security_deposit' => 2000.00,
            'dewa_deposit'     => 0.00,
            'status'           => 'active',
        ]);

        // Rent due: 15000
        RentTransaction::create([
            'contract_id' => $contract->id,
            'date'        => '2026-01-01',
            'description' => 'Rent Due January',
            'debit'       => 15000.00,
            'credit'      => 0.00,
        ]);

        // Tenant paid only 5000
        Payment::create([
            'contract_id' => $contract->id,
            'tenant_id'   => $tenant->id,
            'type'        => 'rent',
            'amount'      => 5000.00,
            'date'        => '2026-01-10',
        ]);

        $result = $this->service->calculate($contract, '2026-01-31');

        // Receivables: 15000 (rent) + 250 (admin) = 15250
        // Received: 5000
        // Deposits: 2000
        // Amount Due = (2000 + 5000) - 15250 = 7000 - 15250 = -8250 (negative = tenant owes)
        $this->assertEquals(-8250.00, $result['settlement_preview']['amount_due']);
        $this->assertEquals('due', $result['settlement_preview']['status']);
    }
}
