<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->appendToGroup('api', \App\Domain\Auth\Http\Middleware\ActiveAccountMiddleware::class);
        $middleware->appendToPriorityList(\Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class, \App\Domain\Auth\Http\Middleware\ActiveAccountMiddleware::class);
        // Reject wrong roles before model binding can reveal record existence.
        $middleware->appendToPriorityList(\App\Domain\Auth\Http\Middleware\ActiveAccountMiddleware::class, \App\Domain\Auth\Http\Middleware\RoleMiddleware::class);
        $middleware->alias([
            'role' => \App\Domain\Auth\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
