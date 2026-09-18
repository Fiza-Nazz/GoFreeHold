<?php
namespace App\Domain\Auth\Services;

use App\Domain\Auth\Models\User;
use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\OwnerStaff;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class OwnerContextResolver
{
    public const STAFF_ROLES = ['cashier', 'accountant', 'maintenance'];

    public function assertActive(User $user): void
    {
        abort_unless($user->account_status === 'active', 403, 'Account is not active.');
        abort_unless(in_array($user->role, ['admin', 'owner', 'tenant', ...self::STAFF_ROLES], true), 403);
        if ($user->role === 'owner' || in_array($user->role, self::STAFF_ROLES, true)) {
            $this->ownerId($user);
        }
    }

    public function ownerId(User $user): int
    {
        abort_unless($user->account_status === 'active', 403, 'Account is not active.');
        if ($user->role === 'owner') {
            $id = Owner::where('user_id', $user->id)->value('id');
        } else {
            abort_unless(in_array($user->role, self::STAFF_ROLES, true), 403);
            $id = OwnerStaff::where('user_id', $user->id)->value('owner_id');
            $ownerUser = $id ? Owner::find($id)?->user_id : null;
            abort_unless($ownerUser && User::whereKey($ownerUser)->where('role', 'owner')->where('account_status', 'active')->exists(), 403, 'Employer account is unavailable.');
        }
        abort_unless($id, 403, 'Owner membership is not configured.');
        return (int) $id;
    }

    public function contracts(Builder $query, int $ownerId): Builder
    {
        return $query->where('contracts.owner_id', $ownerId)
            ->whereHas('unit', fn ($u) => $this->units($u, $ownerId));
    }

    public function units(Builder $query, int $ownerId): Builder
    {
        return $query->where('units.owner_id', $ownerId)
            ->whereHas('property', fn ($p) => $p->where('owner_id', $ownerId));
    }

    public function jobs(Builder $query, User $user): Builder
    {
        $ownerId = $this->ownerId($user);
        return $query->where('jobs.assigned_to', $user->id)
            ->whereHas('complaint.unit', fn ($u) => $this->units($u, $ownerId));
    }

    public function permissions(User $user): array
    {
        return match ($user->role) {
            'admin' => ['properties.read_all'],
            'owner' => ['properties.read_own', 'staff.list', 'staff.create', 'staff.update', 'staff.disable', 'staff.invite'],
            'cashier' => ['payments.read_own_owner', 'payments.create_own_owner', 'receipts.download_own_owner'],
            'accountant' => ['payments.read_own_owner', 'payments.create_own_owner', 'receipts.download_own_owner', 'ledger.read_own_owner'],
            'maintenance' => ['jobs.read_assigned', 'jobs.update_assigned', 'complaints.read_assigned', 'maintenance_report.read_assigned'],
            default => [],
        };
    }

    public function audit(User $actor, string $action, int $target, array $details = []): void
    {
        DB::table('staff_access_audits')->insert([
            'actor_id' => $actor->id, 'owner_id' => $this->ownerId($actor),
            'action' => $action, 'target_id' => $target, 'details' => json_encode($details),
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }
}
