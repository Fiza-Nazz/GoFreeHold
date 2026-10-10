<?php

namespace App\Domain\Platform\Http\Controllers;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\User;
use App\Domain\Platform\Models\Organization;
use App\Domain\Platform\Models\Subscription;
use App\Domain\Platform\Services\AuditService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class OrganizationController extends Controller
{
    /**
     * GET /admin/organizations
     */
    public function index(Request $request): JsonResponse
    {
        $query = Organization::with(['plan', 'owner:id,name,email'])
            ->withCount(['users', 'properties', 'units']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%")
                    ->orWhereHas('owner', fn ($u) => $u->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%"));
            });
        }

        $organizations = $query->orderByDesc('id')->get();

        return response()->json([
            'data' => [
                'organizations' => $organizations,
            ],
        ]);
    }

    /**
     * POST /admin/organizations
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'owner_name'  => 'required|string|max:255',
            'owner_email' => 'required|email|max:255',
            'plan_id'     => 'nullable|exists:subscription_plans,id',
            'status'      => 'nullable|string|in:trial,active,suspended,cancelled',
            'notes'       => 'nullable|string',
        ]);

        $organization = DB::transaction(function () use ($validated) {
            // 1. Find or create Owner user
            $user = User::where('email', $validated['owner_email'])->first();
            if (!$user) {
                $user = User::create([
                    'name'           => $validated['owner_name'],
                    'email'          => $validated['owner_email'],
                    'password'       => Hash::make(Str::random(16)),
                    'role'           => 'owner',
                    'account_status' => 'active',
                ]);
            } else {
                $user->update(['role' => 'owner', 'account_status' => 'active']);
            }

            // 2. Generate slug
            $baseSlug = Str::slug($validated['name']) ?: 'org';
            $slug = $baseSlug;
            $counter = 1;
            while (Organization::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . (++$counter);
            }

            // 3. Create organization
            $org = Organization::create([
                'name'          => $validated['name'],
                'slug'          => $slug,
                'status'        => $validated['status'] ?? 'trial',
                'plan_id'       => $validated['plan_id'] ?? 2, // Growth plan default
                'owner_user_id' => $user->id,
                'trial_ends_at' => ($validated['status'] ?? 'trial') === 'trial' ? now()->addDays(14) : null,
                'subscribed_at' => ($validated['status'] ?? '') === 'active' ? now() : null,
                'notes'         => $validated['notes'] ?? null,
            ]);

            // 4. Link owner user & profile to organization
            $user->update(['organization_id' => $org->id]);

            $ownerProfile = Owner::where('user_id', $user->id)->first();
            if (!$ownerProfile) {
                Owner::create([
                    'user_id' => $user->id,
                    'name'    => $user->name,
                    'email'   => $user->email,
                ]);
            }

            // 5. Create subscription
            Subscription::create([
                'organization_id' => $org->id,
                'plan_id'         => $org->plan_id,
                'status'          => $org->status === 'active' ? 'active' : 'trial',
                'starts_at'       => now(),
                'ends_at'         => now()->addYear(),
            ]);

            AuditService::log(
                'organization.created',
                'organization',
                $org->id,
                ['name' => $org->name, 'owner_email' => $user->email],
                $org->id
            );

            return $org;
        });

        $organization->load(['plan', 'owner:id,name,email'])->loadCount(['users', 'properties', 'units']);

        return response()->json([
            'data' => [
                'organization' => $organization,
            ],
        ], 201);
    }

    /**
     * GET /admin/organizations/{id}
     */
    public function show(Organization $organization): JsonResponse
    {
        $organization->load(['plan', 'owner:id,name,email'])->loadCount(['users', 'properties', 'units']);

        return response()->json([
            'data' => [
                'organization' => $organization,
            ],
        ]);
    }

    /**
     * PUT /admin/organizations/{id}
     */
    public function update(Request $request, Organization $organization): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'sometimes|string|max:255',
            'plan_id' => 'sometimes|nullable|exists:subscription_plans,id',
            'status'  => 'sometimes|string|in:trial,active,suspended,cancelled',
            'notes'   => 'sometimes|nullable|string',
        ]);

        $organization->update($validated);

        AuditService::log(
            'organization.updated',
            'organization',
            $organization->id,
            $validated,
            $organization->id
        );

        $organization->load(['plan', 'owner:id,name,email'])->loadCount(['users', 'properties', 'units']);

        return response()->json([
            'data' => [
                'organization' => $organization,
            ],
        ]);
    }

    /**
     * POST /admin/organizations/{id}/suspend
     */
    public function suspend(Request $request, Organization $organization): JsonResponse
    {
        $reason = $request->input('reason', 'Suspended by platform administrator');

        $notes = $organization->notes;
        $notes = $notes ? ($notes . "\n[Suspended]: " . $reason) : ("[Suspended]: " . $reason);

        $organization->update([
            'status'       => 'suspended',
            'suspended_at' => now(),
            'notes'        => $notes,
        ]);

        AuditService::log(
            'organization.suspended',
            'organization',
            $organization->id,
            ['reason' => $reason],
            $organization->id
        );

        $organization->load(['plan', 'owner:id,name,email'])->loadCount(['users', 'properties', 'units']);

        return response()->json([
            'data' => [
                'organization' => $organization,
            ],
        ]);
    }

    /**
     * POST /admin/organizations/{id}/reactivate
     */
    public function reactivate(Request $request, Organization $organization): JsonResponse
    {
        $organization->update([
            'status'       => 'active',
            'suspended_at' => null,
        ]);

        AuditService::log(
            'organization.reactivated',
            'organization',
            $organization->id,
            ['action' => 'reactivated'],
            $organization->id
        );

        $organization->load(['plan', 'owner:id,name,email'])->loadCount(['users', 'properties', 'units']);

        return response()->json([
            'data' => [
                'organization' => $organization,
            ],
        ]);
    }
}
