<?php

namespace Database\Factories;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

class ComplaintFactory extends Factory
{
    protected $model = Complaint::class;

    public function definition(): array
    {
        return [
            'tenant_id'   => TenantFactory::new(),
            'unit_id'     => UnitFactory::new(),
            'title'       => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'priority'    => 'medium',
            'status'      => 'open',
            'assigned_to' => null,
        ];
    }
}
