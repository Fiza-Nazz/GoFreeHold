<?php

namespace App\Domain\Contract\Policies;

use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\LegalCase;

class LegalCasePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'owner', 'cashier', 'accountant'], true);
    }

    public function view(User $user, LegalCase $legalCase): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        if (in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            return (int) $legalCase->contract?->owner_id === $ownerId
                || (int) $legalCase->contract?->unit?->property?->owner_id === $ownerId
                || (int) $legalCase->settlement?->owner_id === $ownerId;
        }
        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'owner'], true);
    }

    public function update(User $user, LegalCase $legalCase): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        if ($user->role === 'owner') {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            return (int) $legalCase->contract?->owner_id === $ownerId;
        }
        return false;
    }

    public function delete(User $user, LegalCase $legalCase): bool
    {
        return $user->role === 'admin';
    }
}
