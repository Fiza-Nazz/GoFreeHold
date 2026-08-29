<?php

namespace Database\Factories;

use App\Domain\Auth\Models\Owner;
use App\Domain\Contract\Models\Contract;
use App\Domain\Settlement\Models\Settlement;
use Illuminate\Database\Eloquent\Factories\Factory;

class SettlementFactory extends Factory
{
    protected $model = Settlement::class;

    public function definition(): array
    {
        return [
            'owner_id'    => OwnerFactory::new(),
            'contract_id' => ContractFactory::new(),
            'vacant_date' => now()->toDateString(),
            'dues'        => 0.00,
            'receivable'  => 0.00,
            'status'      => 'pending',
            'on_case'     => false,
        ];
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed']);
    }
}
