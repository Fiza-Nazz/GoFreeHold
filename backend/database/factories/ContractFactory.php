<?php

namespace Database\Factories;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Contract\Models\Contract;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContractFactory extends Factory
{
    protected $model = Contract::class;

    public function definition(): array
    {
        return [
            'unit_id'          => UnitFactory::new(),
            'tenant_id'        => TenantFactory::new(),
            'owner_id'         => OwnerFactory::new(),
            'date'             => now()->toDateString(),
            'rent_amount'      => 60000.00,
            'lease_term'       => 12,
            'start_date'       => now()->startOfMonth()->toDateString(),
            'end_date'         => now()->addYear()->endOfMonth()->toDateString(),
            'due_date'         => now()->startOfMonth()->toDateString(),
            'security_deposit' => 3000.00,
            'deposit_type'     => 'refundable',
            'dewa_deposit'     => 1000.00,
            'status'           => 'active',
            'type'             => 'residential',
            'mode_of_payment'  => 'cheque',
            'contract_value'   => 60000.00,
        ];
    }

    public function active(): static
    {
        return $this->state(['status' => 'active']);
    }

    public function vacated(): static
    {
        return $this->state(['status' => 'vacated']);
    }
}
