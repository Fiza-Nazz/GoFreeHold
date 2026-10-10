<?php

namespace App\Domain\Platform\Http\Controllers;

use App\Domain\Auth\Models\User;
use App\Domain\Platform\Services\AuditService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PlatformUserController extends Controller
{
    /**
     * GET /admin/users
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('organization:id,name,status');

        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('account_status')) {
            $query->where('account_status', $request->account_status);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $users = $query->orderByDesc('id')->get();

        return response()->json([
            'data' => [
                'users' => $users,
            ],
        ]);
    }

    /**
     * POST /admin/users
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|max:255|unique:users,email',
            'role'            => 'required|string|in:admin,owner,cashier,accountant,maintenance,tenant',
            'organization_id' => 'nullable|exists:organizations,id',
            'password'        => 'nullable|string|min:6',
            'account_status'  => 'nullable|string|in:active,pending,disabled',
        ]);

        if ($validated['role'] === 'owner' && empty($validated['organization_id'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'The organization_id field is required when role is owner.',
            ], 422);
        }

        $user = User::create([
            'name'            => $validated['name'],
            'email'           => $validated['email'],
            'password'        => Hash::make($validated['password'] ?? Str::random(16)),
            'role'            => $validated['role'],
            'organization_id' => $validated['organization_id'] ?? null,
            'account_status'  => $validated['account_status'] ?? 'active',
        ]);

        AuditService::log(
            'user.created',
            'user',
            $user->id,
            ['email' => $user->email, 'role' => $user->role],
            $user->organization_id
        );

        $user->load('organization:id,name,status');

        return response()->json([
            'data' => [
                'user' => $user,
            ],
        ], 201);
    }

    /**
     * PUT /admin/users/{id}
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'role'            => 'sometimes|string|in:admin,owner,cashier,accountant,maintenance,tenant',
            'organization_id' => 'sometimes|nullable|exists:organizations,id',
            'account_status'  => 'sometimes|string|in:active,pending,disabled',
            'password'        => 'sometimes|nullable|string|min:6',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        AuditService::log(
            'user.updated',
            'user',
            $user->id,
            $validated,
            $user->organization_id
        );

        $user->load('organization:id,name,status');

        return response()->json([
            'data' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * POST /admin/users/{id}/disable
     */
    public function disable(User $user): JsonResponse
    {
        $user->update(['account_status' => 'disabled']);
        $user->tokens()->delete();

        AuditService::log(
            'user.disabled',
            'user',
            $user->id,
            ['action' => 'disabled'],
            $user->organization_id
        );

        $user->load('organization:id,name,status');

        return response()->json([
            'data' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * POST /admin/users/{id}/enable
     */
    public function enable(User $user): JsonResponse
    {
        $user->update(['account_status' => 'active']);

        AuditService::log(
            'user.enabled',
            'user',
            $user->id,
            ['action' => 'enabled'],
            $user->organization_id
        );

        $user->load('organization:id,name,status');

        return response()->json([
            'data' => [
                'user' => $user,
            ],
        ]);
    }
}
