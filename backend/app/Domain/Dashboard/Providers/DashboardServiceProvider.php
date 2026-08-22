<?php

namespace App\Domain\Dashboard\Providers;

use App\Domain\Dashboard\Services\LedgerRebuildService;
use App\Domain\Dashboard\Services\PostMonthlyRentService;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class DashboardServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(LedgerRebuildService::class);
        $this->app->singleton(PostMonthlyRentService::class);
    }

    public function boot(): void
    {
        $this->registerDashboardRoutes();
    }

    /**
     * Domain-owned Module 2 (Dashboard & Financial Tools) API routes.
     */
    protected function registerDashboardRoutes(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__ . '/../routes/api.php');
    }
}
