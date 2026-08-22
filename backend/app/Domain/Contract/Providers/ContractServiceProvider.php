<?php

namespace App\Domain\Contract\Providers;

use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Models\LegalCase;
use App\Domain\Contract\Policies\ContractPolicy;
use App\Domain\Contract\Policies\LegalCasePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class ContractServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(\App\Domain\Contract\Services\ContractVacateService::class);
    }

    public function boot(): void
    {
        Gate::policy(Contract::class, ContractPolicy::class);
        Gate::policy(LegalCase::class, LegalCasePolicy::class);

        $this->registerContractRoutes();
    }

    protected function registerContractRoutes(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__ . '/../routes/api.php');
    }
}