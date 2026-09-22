<?php
namespace App\Domain\Auth\Services;

use App\Domain\Auth\Models\{User, OwnerStaff, StaffInvitation};
use App\Domain\Auth\Notifications\StaffInvitationNotification;
use App\Domain\Maintenance\Models\Job;
use Illuminate\Support\Facades\{DB, Notification};
use Illuminate\Support\Str;

class StaffAccountService
{
    public function __construct(private OwnerContextResolver $context) {}

    public function create(User $actor, array $data): OwnerStaff
    {
        return DB::transaction(function () use ($actor, $data) {
            $ownerId = $this->context->ownerId($actor);
            $hasExplicitPassword = !empty($data['password']);
            $password = $hasExplicitPassword ? $data['password'] : Str::random(64);
            $accountStatus = $hasExplicitPassword ? 'active' : 'pending';

            try {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'role' => $data['role'],
                    'password' => $password,
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
                if (($e->errorInfo[1] ?? null) === 1062) {
                    throw \Illuminate\Validation\ValidationException::withMessages(['email' => ['This email is already registered.']]);
                }
                throw $e;
            }

            $user->forceFill([
                'account_status' => $accountStatus,
                'email_verified_at' => now(),
            ])->save();

            $staff = OwnerStaff::create([
                'user_id' => $user->id,
                'owner_id' => $ownerId,
                'created_by' => $actor->id
            ]);

            $this->context->audit($actor, 'staff.created', $user->id, ['role' => $user->role]);

            if (! $hasExplicitPassword) {
                $this->invite($actor, $staff);
            }

            return $staff;
        });
    }

    public function invite(User $actor, OwnerStaff $staff): void
    {
        DB::transaction(function () use ($actor, $staff) {
            $user = User::lockForUpdate()->findOrFail($staff->user_id);
            abort_if($user->account_status === 'disabled', 409, 'Enable the staff account before inviting.');
            abort_if($user->account_status === 'active', 409, 'Account already active. Use password reset.');
            $staff->invitations()->whereNull('accepted_at')->whereNull('revoked_at')->update(['revoked_at' => now()]);
            $raw = Str::random(64);
            $invite = $staff->invitations()->create(['token_hash' => hash('sha256', $raw), 'expires_at' => now()->addDay(), 'created_by' => $actor->id]);
            $this->context->audit($actor, 'staff.invited', $user->id);
            DB::afterCommit(function () use ($invite, $user, $raw) {
                // Do not leak activation tokens to the log mailer.
                if (config('mail.default') === 'log') {
                    $invite->update(['delivery_status' => 'not_configured']);
                    return;
                }
                try {
                    $url = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/') . '/staff/activate#token=' . $raw;
                    Notification::send($user, new StaffInvitationNotification($url));
                    $invite->update(['delivery_status' => (app()->environment('testing') || config('mail.default') === 'array') ? 'captured' : 'sent']);
                } catch (\Throwable $e) {
                    $invite->update(['delivery_status' => 'failed']);
                }
            });
        });
    }

    public function accept(string $raw, string $password): void
    {
        DB::transaction(function () use ($raw, $password) {
            $lookup = StaffInvitation::where('token_hash', hash('sha256', $raw))->first();
            abort_unless($lookup, 422, 'Invitation is invalid or expired.');
            $user = User::lockForUpdate()->findOrFail($lookup->staff->user_id);
            $invite = StaffInvitation::lockForUpdate()->findOrFail($lookup->id);
            abort_if($invite->accepted_at || $invite->revoked_at || $invite->expires_at->isPast() || $user->account_status !== 'pending', 422, 'Invitation is invalid or expired.');
            $owner = $lookup->staff->owner?->user;
            abort_unless($owner && $owner->role === 'owner' && $owner->account_status === 'active', 403);
            $user->forceFill(['password' => $password, 'account_status' => 'active'])->save();
            $invite->update(['accepted_at' => now()]);
            $this->context->audit($user, 'staff.activated', $user->id);
        });
    }

    public function update(User $actor, OwnerStaff $staff, array $data): void
    {
        DB::transaction(function () use ($actor, $staff, $data) {
            $user = User::lockForUpdate()->findOrFail($staff->user_id);
            $before = $user->only(['name', 'role', 'account_status']);
            if (isset($data['role']) && $data['role'] !== $user->role) {
                abort_if(Job::where('assigned_to', $user->id)->where('status', '!=', 'completed')->exists(), 409, 'Reassign unfinished jobs before changing this role.');
                $user->revokeSessions();
                $staff->invitations()->whereNull('accepted_at')->whereNull('revoked_at')->update(['revoked_at' => now()]);
            }
            if (!empty($data['password'])) {
                $user->password = $data['password'];
                $user->account_status = 'active';
                $user->revokeSessions();
            }
            unset($data['password']);
            $user->fill($data)->save();
            $this->context->audit($actor, 'staff.updated', $user->id, ['before' => $before, 'after' => $user->only(['name', 'role', 'account_status'])]);
        });
    }

    public function status(User $actor, OwnerStaff $staff, bool $enable, ?string $reason): void
    {
        DB::transaction(function () use ($actor, $staff, $enable, $reason) {
            $user = User::lockForUpdate()->findOrFail($staff->user_id);
            $pending = $staff->invitations()->exists() && ! $staff->invitations()->whereNotNull('accepted_at')->exists();
            $user->forceFill(['account_status' => $enable ? ($pending ? 'pending' : 'active') : 'disabled'])->save();
            $user->revokeSessions();
            $staff->invitations()->whereNull('accepted_at')->whereNull('revoked_at')->update(['revoked_at' => now()]);
            $this->context->audit($actor, $enable ? 'staff.enabled' : 'staff.disabled', $user->id, ['reason' => $reason]);
        });
    }
}
