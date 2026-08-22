<?php

namespace App\Domain\Property\Policies;

use App\Domain\Auth\Models\User;
use App\Domain\Property\Models\Unit;

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'owner'], true);
    }

    public function view(User $user, Unit $unit): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        if ($user->role === 'owner') {
            return (int) $user->id === (int) $unit->owner_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Unit $unit): bool
    {
        return $user->role === 'admin';
    }

    /** Advance booking + cash receipt (admin only). */
    public function book(User $user): bool
    {
        return $user->role === 'admin';
    }
}
