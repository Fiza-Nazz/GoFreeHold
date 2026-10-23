<?php

namespace App\Domain\Maintenance\Policies;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\OwnerStaff;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Maintenance\Models\Complaint;

class ComplaintPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['owner', 'maintenance', 'tenant', 'cashier', 'accountant', 'admin'], true);
    }

    public function view(User $user, Complaint $complaint): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'tenant') {
            $tenantId = Tenant::where('user_id', $user->id)->value('id');
            return $tenantId && (int) $complaint->tenant_id === (int) $tenantId;
        }

        $ownerId = $this->resolveOwnerId($user);
        if (!$ownerId) {
            return false;
        }

        $complaintOwnerId = (int) ($complaint->unit?->property?->owner_id ?? $complaint->unit?->owner_id);
        return $complaintOwnerId === (int) $ownerId;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['tenant', 'owner', 'maintenance', 'cashier', 'accountant', 'admin'], true);
    }

    public function assign(User $user, Complaint $complaint): bool
    {
        if ($user->role === 'tenant') {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        $ownerId = $this->resolveOwnerId($user);
        if (!$ownerId) {
            return false;
        }

        $complaintOwnerId = (int) ($complaint->unit?->property?->owner_id ?? $complaint->unit?->owner_id);
        return $complaintOwnerId === (int) $ownerId && in_array($user->role, ['owner', 'maintenance', 'cashier', 'accountant'], true);
    }

    public function updateStatus(User $user, Complaint $complaint): bool
    {
        if ($user->role === 'tenant') {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        $ownerId = $this->resolveOwnerId($user);
        if (!$ownerId) {
            return false;
        }

        $complaintOwnerId = (int) ($complaint->unit?->property?->owner_id ?? $complaint->unit?->owner_id);
        return $complaintOwnerId === (int) $ownerId && in_array($user->role, ['owner', 'maintenance', 'cashier', 'accountant'], true);
    }

    public function attach(User $user, Complaint $complaint): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'tenant') {
            return false; // Tenants attach photos on create; late attach restricted to staff
        }

        $ownerId = $this->resolveOwnerId($user);
        if (!$ownerId) {
            return false;
        }

        $complaintOwnerId = (int) ($complaint->unit?->property?->owner_id ?? $complaint->unit?->owner_id);
        return $complaintOwnerId === (int) $ownerId;
    }

    private function resolveOwnerId(User $user): ?int
    {
        if ($user->role === 'owner') {
            return Owner::where('user_id', $user->id)->value('id');
        }

        if (in_array($user->role, ['cashier', 'accountant', 'maintenance'], true)) {
            return OwnerStaff::where('user_id', $user->id)->value('owner_id');
        }

        return null;
    }
}
