<?php

namespace Database\Factories;

use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

class UnitFactory extends Factory
{
    protected $model = Unit::class;

    public function definition(): array
    {
        return [
            'property_id' => PropertyFactory::new(),
            'owner_id'    => OwnerFactory::new(),
            'number'      => (string)$this->faker->numberBetween(101, 999),
            'dhewa_no'    => $this->faker->numerify('DEWA-#####'),
            'category'    => 'standard',
            'type'        => 'apartment',
            'floor'       => (string)$this->faker->numberBetween(1, 25),
            'size'        => $this->faker->numberBetween(500, 2500),
            'furnished'   => false,
            'price'       => $this->faker->numberBetween(40000, 180000),
            'status'      => 'AVAILABLE',
        ];
    }

    public function occupied(): static
    {
        return $this->state(['status' => 'OCCUPIED']);
    }

    public function booked(): static
    {
        return $this->state(['status' => 'BOOKED']);
    }
}
