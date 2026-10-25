<?php

namespace App\Domain\Auth\Services;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TenantPortalProvisioner
{
    /**
     * Provision or link a tenant portal account.
     *
     * @param  array  $data
     * @param  bool  $forcePasswordReset
     * @return array
     *
     * @throws ValidationException
     */
    public function provision(array $data, bool $forcePasswordReset = false): array
    {
        $rawEmail = $data['email'] ?? ($data['tenant_email'] ?? null);
        if (empty($rawEmail)) {
            throw ValidationException::withMessages([
                'tenant_email' => ['A valid tenant email is required for portal provisioning.'],
            ]);
        }

        $email = strtolower(trim($rawEmail));
        $name = trim($data['name'] ?? ($data['tenant_name'] ?? 'Tenant User'));

        // 1. Reject if email belongs to a user whose role is NOT tenant
        $existingUser = User::where('email', $email)->first();
        if ($existingUser && $existingUser->role !== 'tenant') {
            throw ValidationException::withMessages([
                'tenant_email' => ['This email belongs to a staff or owner account.'],
            ]);
        }

        $tempPassword = null;
        $passwordSet = false;
        $wasCreated = false;

        // 2. User record creation or password rotation
        if ($existingUser) {
            $user = $existingUser;
            if ($forcePasswordReset) {
                $tempPassword = Str::password(12, true, true, false);
                $user->update([
                    'password' => Hash::make($tempPassword),
                ]);
                $passwordSet = true;
            }
        } else {
            $tempPassword = Str::password(12, true, true, false);
            $user = User::create([
                'name'           => $name,
                'email'          => $email,
                'password'       => Hash::make($tempPassword),
                'role'           => 'tenant',
                'account_status' => 'active',
            ]);
            $passwordSet = true;
            $wasCreated = true;
        }

        // 3. Link or update Tenant profile row
        $tenant = Tenant::where('user_id', $user->id)->first();
        if (!$tenant && !empty($data['tenant_id'])) {
            $tenant = Tenant::find($data['tenant_id']);
        }
        if (!$tenant) {
            $tenant = Tenant::where('email', $email)->first();
        }

        $phone = $data['phone'] ?? ($data['tenant_phone'] ?? ($data['contact'] ?? null));
        $emiratesId = $data['emirates_id'] ?? ($data['tenant_emirates_id'] ?? null);
        $nationality = $data['nationality'] ?? ($data['tenant_nationality'] ?? null);
        $passport = $data['passport_number'] ?? ($data['tenant_passport_number'] ?? null);
        $address = $data['address'] ?? ($data['tenant_address'] ?? null);
        $ownerId = $data['owner_id'] ?? null;

        if ($tenant) {
            $tenantUpdates = ['user_id' => $user->id];
            if (!empty($name)) {
                $tenantUpdates['name'] = $name;
            }
            if (!empty($email)) {
                $tenantUpdates['email'] = $email;
            }
            if (!empty($phone)) {
                $tenantUpdates['phone'] = $phone;
                $tenantUpdates['contact'] = $phone;
            }
            if (!empty($emiratesId)) {
                $tenantUpdates['emirates_id'] = $emiratesId;
            }
            if (!empty($nationality)) {
                $tenantUpdates['nationality'] = $nationality;
            }
            if (!empty($passport)) {
                $tenantUpdates['passport_number'] = $passport;
            }
            if (!empty($address)) {
                $tenantUpdates['address'] = $address;
            }
            if (!empty($ownerId) && empty($tenant->owner_id)) {
                $tenantUpdates['owner_id'] = $ownerId;
            }
            $tenant->update($tenantUpdates);
        } else {
            $tenant = Tenant::create([
                'user_id'         => $user->id,
                'owner_id'        => $ownerId,
                'name'            => $name,
                'email'           => $email,
                'phone'           => $phone,
                'contact'         => $phone,
                'emirates_id'     => $emiratesId,
                'nationality'     => $nationality,
                'passport_number' => $passport,
                'address'         => $address,
            ]);
        }

        return [
            'user'          => $user,
            'tenant'        => $tenant->fresh(),
            'temp_password' => $tempPassword,
            'was_created'   => $wasCreated,
            'password_set'  => $passwordSet,
        ];
    }

    /**
     * Check if a tenant user currently has at least one active/renewed lease with end_date >= today.
     *
     * @param  User  $user
     * @return bool
     */
    public function tenantHasActiveLease(User $user): bool
    {
        $tenantId = Tenant::where('user_id', $user->id)->value('id');
        if (!$tenantId) {
            return false;
        }

        return Contract::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('status', ['active', 'renewed'])
            ->whereDate('end_date', '>=', now()->toDateString())
            ->exists();
    }

    /**
     * Check if a Tenant model currently has an active lease.
     *
     * @param  Tenant  $tenant
     * @return bool
     */
    public function tenantModelHasActiveLease(Tenant $tenant): bool
    {
        return Contract::query()
            ->where('tenant_id', $tenant->id)
            ->whereIn('status', ['active', 'renewed'])
            ->whereDate('end_date', '>=', now()->toDateString())
            ->exists();
    }
}
