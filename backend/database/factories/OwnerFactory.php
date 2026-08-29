<?php

namespace Database\Factories;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OwnerFactory extends Factory
{
    protected $model = Owner::class;

    public function definition(): array
    {
        $user = User::factory()->create(['role' => 'owner']);

        return [
            'user_id' => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'contact' => $this->faker->phoneNumber(),
            'address' => $this->faker->address(),
        ];
    }
}
