<?php
namespace App\Domain\Maintenance\Services;

use App\Domain\Auth\Models\User;
use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Maintenance\Models\Complaint;
use Illuminate\Validation\ValidationException;

class JobAccessService
{
    public function technician(Complaint $complaint, int $userId): User
    {
        $user = User::lockForUpdate()->find($userId);
        $ownerId = $complaint->unit?->property?->owner_id;
        if (!$user || $user->role !== 'maintenance' || $user->account_status !== 'active'
            || !$ownerId || (int) $complaint->unit?->owner_id !== (int) $ownerId
            || !$user->staffMembership()->where('owner_id', $ownerId)->exists()
            || !$user->staffMembership?->owner?->user || $user->staffMembership->owner->user->account_status !== 'active') {
            throw ValidationException::withMessages(['assigned_to' => ['Choose an active maintenance worker belonging to this property owner.']]);
        }
        return $user;
    }
}
