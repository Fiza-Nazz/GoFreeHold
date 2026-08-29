<?php

namespace Database\Factories;

use App\Domain\Auth\Models\Owner;
use App\Domain\Property\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

class PropertyFactory extends Factory
{
    protected $model = Property::class;

    public function definition(): array
    {
        return [
            'owner_id'    => OwnerFactory::new(),
            'name'        => $this->faker->company() . ' Tower',
            'address'     => $this->faker->streetAddress(),
            'city'        => 'Dubai',
            'description' => $this->faker->sentence(),
            'type'        => 'residential',
            'total_units' => 10,
        ];
    }
}
