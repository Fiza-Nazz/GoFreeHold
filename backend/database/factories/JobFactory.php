<?php

namespace Database\Factories;

use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Maintenance\Models\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobFactory extends Factory
{
    protected $model = Job::class;

    public function definition(): array
    {
        return [
            'complaint_id'   => ComplaintFactory::new(),
            'status'         => 'open',
            'scheduled_date' => now()->toDateString(),
            'notes'          => 'Initial maintenance job inspection',
        ];
    }
}
