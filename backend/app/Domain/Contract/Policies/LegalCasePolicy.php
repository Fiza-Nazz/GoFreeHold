<?php

namespace App\Domain\Contract\Policies;

use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\LegalCase;

class LegalCasePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(User $user, LegalCase $legalCase): bool
    {
        return $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, LegalCase $legalCase): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, LegalCase $legalCase): bool
    {
        return $user->role === 'admin';
    }
}
