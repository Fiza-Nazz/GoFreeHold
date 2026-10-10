<?php

namespace App\Domain\Platform\Services;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Platform\Models\AuditLog;
use App\Domain\Platform\Models\Organization;
use App\Domain\Platform\Models\Subscription;
use App\Domain\Platform\Models\SubscriptionPlan;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;

class PlatformDashboardService
{
    /**
     * Compute cross-customer SaaS platform KPIs.
     */
    public function getStats(): array
    {
        $totalOrgs      = Organization::count();
        $activeOrgs     = Organization::where('status', 'active')->count();
        $trialOrgs      = Organization::where('status', 'trial')->count();
        $suspendedOrgs  = Organization::where('status', 'suspended')->count();

        $activeUsers    = User::where('account_status', 'active')->count();
        $totalOwners    = User::where('role', 'owner')->count() ?: Owner::count();
        $totalStaff     = User::whereIn('role', ['cashier', 'accountant', 'maintenance'])->count();
        $totalTenants   = User::where('role', 'tenant')->count() ?: Tenant::count();

        $totalProperties = Property::count();
        $totalUnits      = Unit::count();
        $occupiedUnits   = Unit::where('status', 'OCCUPIED')->count();
        $vacantUnits     = Unit::where('status', 'AVAILABLE')->count();

        $totalContracts  = Contract::count();
        $activeContracts = Contract::where('status', 'active')->count();

        // Calculate subscription MRR from active subscriptions joined with plan price
        $mrr = (float) Subscription::where('subscriptions.status', 'active')
            ->join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
            ->sum('subscription_plans.price_monthly');

        // If no active subscriptions recorded yet, compute from organizations with plan_id
        if ($mrr <= 0) {
            $mrr = (float) Organization::where('organizations.status', 'active')
                ->whereNotNull('organizations.plan_id')
                ->join('subscription_plans', 'organizations.plan_id', '=', 'subscription_plans.id')
                ->sum('subscription_plans.price_monthly');
        }

        $recentAudit = AuditLog::with('actor:id,name,email')
            ->orderByDesc('id')
            ->take(10)
            ->get();

        return [
            'total_organizations'     => $totalOrgs,
            'active_organizations'    => $activeOrgs,
            'trial_organizations'     => $trialOrgs,
            'suspended_organizations' => $suspendedOrgs,
            'active_users'            => $activeUsers,
            'total_owners'            => $totalOwners,
            'total_staff'             => $totalStaff,
            'total_tenants'           => $totalTenants,
            'total_properties'        => $totalProperties,
            'total_units'             => $totalUnits,
            'occupied_units'          => $occupiedUnits,
            'vacant_units'            => $vacantUnits,
            'total_contracts'         => $totalContracts,
            'active_contracts'        => $activeContracts,
            'subscription_mrr'        => $mrr,
            'recent_audit'            => $recentAudit,

            // Legacy backward-compatibility aliases
            'owners'                  => $totalOwners,
            'properties'              => $totalProperties,
            'units'                   => $totalUnits,
            'units_occupied'          => $occupiedUnits,
            'units_available'         => $vacantUnits,
            'tenants'                 => $totalTenants,
            'contracts_active'        => $activeContracts,
            'contracts_total'         => $totalContracts,
        ];
    }
}
