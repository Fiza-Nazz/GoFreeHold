<?php

namespace Database\Factories;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        $user = User::factory()->create(['role' => 'tenant']);

        return [
            'user_id'        => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'contact'        => $this->faker->phoneNumber(),
            'address'        => $this->faker->address(),
            'emirates_id'    => $this->faker->numerify('784-####-#######-#'),
            'phone'          => $this->faker->phoneNumber(),
            'nationality'    => $this->faker->country(),
            'passport_number'=> strtoupper($this->faker->bothify('??######')),
        ];
    }
}
