<?php

namespace App\Domain\Maintenance\Providers;

use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Maintenance\Policies\ComplaintPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class MaintenanceServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Complaint::class, ComplaintPolicy::class);

        $this->registerMaintenanceRoutes();
    }

    protected function registerMaintenanceRoutes(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__ . '/../routes/api.php');
    }
}
