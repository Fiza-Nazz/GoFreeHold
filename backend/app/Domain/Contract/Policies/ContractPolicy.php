<?php

namespace App\Domain\Contract\Policies;

use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;

class ContractPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'owner']);
    }

    public function view(User $user, Contract $contract): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        if ($user->role === 'owner') {
            return $user->id === $contract->owner_id;
        }
        if ($user->role === 'tenant') {
            return $user->id === ($contract->tenant->user_id ?? null);
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Contract $contract): bool
    {
        return $user->role === 'admin';
    }
}