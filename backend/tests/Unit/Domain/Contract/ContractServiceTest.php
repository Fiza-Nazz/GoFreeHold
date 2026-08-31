<?php

namespace Tests\Unit\Domain\Contract;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Services\ContractService;
use App\Domain\Property\Models\Unit;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class ContractServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ContractService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ContractService::class);
    }

    public function test_creates_contract_with_existing_tenant_id(): void
    {
        $unit   = Unit::factory()->create(['status' => 'AVAILABLE']);
        $owner  = Owner::factory()->create();
        $tenant = Tenant::factory()->create();

        $contract = $this->service->createContract([
            'unit_id'          => $unit->id,
            'owner_id'         => $owner->id,
            'tenant_id'        => $tenant->id,
            'start_date'       => Carbon::now()->startOfMonth()->toDateString(),
            'end_date'         => Carbon::now()->addYear()->startOfMonth()->toDateString(),
            'due_date'         => Carbon::now()->startOfMonth()->toDateString(),
            'rent_amount'      => 3000,
            'security_deposit' => 5000,
            'type'             => 'residential',
            'mode_of_payment'  => 'cheque',
        ]);

        $this->assertInstanceOf(Contract::class, $contract);
        $this->assertEquals($tenant->id, $contract->tenant_id);
        $this->assertEquals('active', $contract->status);

        // Asserts unit is occupied
        $this->assertEquals('OCCUPIED', $unit->fresh()->status);

        // Asserts initial rent due posted
        $this->assertDatabaseHas('rent_transactions', [
            'contract_id' => $contract->id,
            'debit'       => 3000,
            'credit'      => 0,
        ]);
    }

    public function test_creates_contract_with_automatic_tenant_and_user_creation(): void
    {
        $unit  = Unit::factory()->create(['status' => 'AVAILABLE']);
        $owner = Owner::factory()->create();

        $contract = $this->service->createContract([
            'unit_id'                => $unit->id,
            'owner_id'               => $owner->id,
            'tenant_name'            => 'Rashid Al Maktoum',
            'tenant_email'           => 'rashid.tenant@example.com',
            'tenant_phone'           => '+971501234567',
            'tenant_emirates_id'     => '784-1990-1234567-1',
            'tenant_nationality'     => 'Emirati',
            'tenant_passport_number' => 'N12345678',
            'tenant_address'         => 'Downtown Dubai',
            'start_date'             => Carbon::now()->startOfMonth()->toDateString(),
            'end_date'               => Carbon::now()->addYear()->startOfMonth()->toDateString(),
            'due_date'               => Carbon::now()->startOfMonth()->toDateString(),
            'rent_amount'            => 12000,
            'security_deposit'       => 10000,
            'type'                   => 'residential',
            'mode_of_payment'        => 'bank_transfer',
        ]);

        $this->assertInstanceOf(Contract::class, $contract);

        // Verify User was automatically created
        $this->assertDatabaseHas('users', [
            'email' => 'rashid.tenant@example.com',
            'name'  => 'Rashid Al Maktoum',
            'role'  => 'tenant',
        ]);

        // Verify Tenant profile was automatically created
        $this->assertDatabaseHas('tenants', [
            'email'           => 'rashid.tenant@example.com',
            'name'            => 'Rashid Al Maktoum',
            'emirates_id'     => '784-1990-1234567-1',
            'phone'           => '+971501234567',
            'nationality'     => 'Emirati',
            'passport_number' => 'N12345678',
        ]);

        $newTenant = Tenant::where('email', 'rashid.tenant@example.com')->first();
        $this->assertEquals($newTenant->id, $contract->tenant_id);

        // Verify Unit status & Rent debit
        $this->assertEquals('OCCUPIED', $unit->fresh()->status);
        $this->assertDatabaseHas('rent_transactions', [
            'contract_id' => $contract->id,
            'debit'       => 12000,
        ]);
    }

    public function test_cannot_create_contract_on_occupied_unit(): void
    {
        $unit   = Unit::factory()->occupied()->create();
        $owner  = Owner::factory()->create();
        $tenant = Tenant::factory()->create();

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('The selected unit is already occupied.');

        $this->service->createContract([
            'unit_id'          => $unit->id,
            'owner_id'         => $owner->id,
            'tenant_id'        => $tenant->id,
            'start_date'       => Carbon::now()->startOfMonth()->toDateString(),
            'end_date'         => Carbon::now()->addYear()->startOfMonth()->toDateString(),
            'rent_amount'      => 5000,
            'security_deposit' => 2000,
            'type'             => 'residential',
            'mode_of_payment'  => 'cash',
        ]);
    }

    public function test_renew_contract_updates_end_date_and_rent(): void
    {
        $contract = Contract::factory()->active()->create([
            'end_date'    => '2026-12-31',
            'rent_amount' => 5000,
        ]);

        $renewed = $this->service->renewContract($contract, [
            'new_end_date'    => '2027-12-31',
            'new_rent_amount' => 5500,
        ]);

        $this->assertEquals('2027-12-31', $renewed->fresh()->end_date->toDateString());
        $this->assertEquals(5500, $renewed->fresh()->rent_amount);
        $this->assertEquals('active', $renewed->fresh()->status);
    }
}
