<?php

namespace App\Domain\Property\Providers;

use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use App\Domain\Property\Policies\PropertyPolicy;
use App\Domain\Property\Policies\UnitPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class PropertyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Unit::class, UnitPolicy::class);
        Gate::policy(Property::class, PropertyPolicy::class);

        $this->registerPropertyRoutes();
    }

    protected function registerPropertyRoutes(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__ . '/../routes/api.php');
    }
}
