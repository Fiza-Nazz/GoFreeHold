<?php

namespace App\Domain\Auth\Policies;

use App\Domain\Auth\Models\User;

/**
 * Role-based access helpers used by Auth domain.
 * Endpoint gating is primarily via RoleMiddleware; this policy
 * supports Gate::authorize('accessRole', 'admin') style checks.
 */
class RolePolicy
{
    public function accessRole(User $user, string $role): bool
    {
        return $user->role === $role;
    }

    public function accessAnyRole(User $user, array $roles): bool
    {
        return in_array($user->role, $roles, true);
    }
}
