<?php

namespace App\Domain\Platform\Services;

use App\Domain\Auth\Models\User;
use Illuminate\Http\Request;

class ImpersonationService
{
    /**
     * Start a short-lived support impersonation session.
     */
    public function start(User $admin, int $targetUserId): array
    {
        $target = User::with('organization')->findOrFail($targetUserId);

        abort_if($target->role === 'admin', 422, 'Cannot impersonate another administrator.');

        // Generate short-lived Sanctum token
        $token = $target->createToken('impersonation_' . $admin->id, ['*'], now()->addMinutes(60))->plainTextToken;

        AuditService::log(
            'impersonation.started',
            'user',
            $target->id,
            ['target_user_id' => $target->id, 'admin_id' => $admin->id],
            $target->organization_id,
            $admin->id
        );

        return [
            'token'         => $token,
            'user'          => [
                'id'              => $target->id,
                'name'            => $target->name,
                'email'           => $target->email,
                'role'            => $target->role,
                'organization_id' => $target->organization_id,
                'organization'    => $target->organization ? [
                    'id'     => $target->organization->id,
                    'name'   => $target->organization->name,
                    'status' => $target->organization->status,
                ] : null,
            ],
            'impersonation' => [
                'active'         => true,
                'actor_id'       => $admin->id,
                'actor_name'     => $admin->name,
                'target_user_id' => $target->id,
                'started_at'     => now()->toIso8601String(),
                'expires_at'     => now()->addMinutes(60)->toIso8601String(),
            ],
        ];
    }

    /**
     * End impersonation session and restore platform admin session.
     */
    public function exit(Request $request): array
    {
        $currentUser = $request->user();

        // Delete the impersonation token used for this request
        if ($currentUser && $token = $currentUser->currentAccessToken()) {
            $token->delete();
        }

        // Restore platform admin
        $admin = User::where('role', 'admin')->firstOrFail();
        $adminToken = $admin->createToken('auth_token')->plainTextToken;

        AuditService::log(
            'impersonation.exited',
            'user',
            $currentUser?->id,
            ['restored_admin_id' => $admin->id],
            null,
            $admin->id
        );

        return [
            'token' => $adminToken,
            'user'  => [
                'id'    => $admin->id,
                'name'  => $admin->name,
                'email' => $admin->email,
                'role'  => 'admin',
            ],
        ];
    }
}
