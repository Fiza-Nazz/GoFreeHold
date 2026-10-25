<?php

namespace App\Domain\Auth\Http\Middleware;

use App\Domain\Auth\Services\TenantPortalProvisioner;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantLeaseActive
{
    public function __construct(private readonly TenantPortalProvisioner $provisioner)
    {
    }

    /**
     * Handle an incoming request.
     * Deny tenant portal operations if the tenant has no active/renewed lease.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->role === 'tenant') {
            if (!$this->provisioner->tenantHasActiveLease($user)) {
                return response()->json([
                    'status'  => 'error',
                    'code'    => 'TENANT_LEASE_INACTIVE',
                    'message' => 'Your lease is not active. Portal access is disabled.',
                ], 403);
            }
        }

        return $next($request);
    }
}
