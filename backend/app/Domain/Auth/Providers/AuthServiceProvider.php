<?php

namespace App\Domain\Auth\Providers;

use App\Domain\Auth\Models\User;
use App\Domain\Auth\Policies\RolePolicy;
use App\Domain\Auth\Services\AuthService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AuthService::class);
    }

    public function boot(): void
    {
        Gate::define('accessRole', function (User $user, string $role) {
            return (new RolePolicy)->accessRole($user, $role);
        });

        Gate::define('accessAnyRole', function (User $user, array $roles) {
            return (new RolePolicy)->accessAnyRole($user, $roles);
        });

        $this->registerAuthRoutes();
    }

    /**
     * Domain-owned Auth routes (API + web password.reset).
     */
    protected function registerAuthRoutes(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(__DIR__ . '/../routes/api.php');

        Route::middleware('web')
            ->group(__DIR__ . '/../routes/web.php');
    }
}
