<?php

namespace App\Domain\Property\Policies;

use App\Domain\Auth\Models\User;
use App\Domain\Property\Models\Property;

class PropertyPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'owner'], true);
    }

    public function view(User $user, Property $property): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'owner') {
            return (int) $user->id === (int) $property->owner_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Property $property): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Property $property): bool
    {
        return $user->role === 'admin';
    }
}
