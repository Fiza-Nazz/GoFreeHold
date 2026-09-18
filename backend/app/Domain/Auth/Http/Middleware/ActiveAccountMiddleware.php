<?php
namespace App\Domain\Auth\Http\Middleware;

use App\Domain\Auth\Services\OwnerContextResolver;
use Closure;
use Illuminate\Http\Request;

class ActiveAccountMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if ($user = $request->user()) {
            $user->refresh();
            try {
                app(OwnerContextResolver::class)->assertActive($user);
            } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
                return response()->json(['message' => $e->getMessage(), 'code' => 'ACCOUNT_ACCESS_DENIED'], $e->getStatusCode());
            }
        }
        return $next($request);
    }
}
