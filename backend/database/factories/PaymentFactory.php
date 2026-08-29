<?php

namespace Database\Factories;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'contract_id'    => ContractFactory::new(),
            'tenant_id'      => TenantFactory::new(),
            'type'           => 'rent',
            'mode'           => 'cash',
            'amount'         => 5000.00,
            'date'           => now()->toDateString(),
            'due_date'       => now()->toDateString(),
            'receipt_number' => 'REC-' . $this->faker->numerify('#####'),
        ];
    }
}
