<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Auth\Mail\TenantPortalCredentialsMail;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Services\TenantPortalProvisioner;
use App\Domain\Property\Services\PropertyService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class TenantController extends Controller
{
    public function __construct(
        private readonly PropertyService $properties,
        private readonly TenantPortalProvisioner $provisioner
    ) {
    }

    private function assertTenantAccess(Request $request, Tenant $tenant): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $belongsToOwner = ((int) $tenant->owner_id === (int) $ownerId) || (
                $tenant->owner_id === null &&
                $tenant->contracts()->where(function ($q) use ($ownerId) {
                    $q->where('contracts.owner_id', $ownerId)
                      ->orWhereHas('unit.property', fn ($p) => $p->where('owner_id', $ownerId));
                })->exists()
            );
            abort_unless($belongsToOwner, 403, 'Unauthorized access to this tenant.');
        }
    }

    private function backfillMissingTenantOwners(): void
    {
        $unassigned = Tenant::whereNull('owner_id')->with('contracts.unit.property')->get();
        foreach ($unassigned as $t) {
            $contract = $t->contracts->first();
            $resolvedOwnerId = $contract?->owner_id ?: $contract?->unit?->property?->owner_id;
            if ($resolvedOwnerId) {
                $t->update(['owner_id' => $resolvedOwnerId]);
            }
        }
    }

    public function index(Request $request): JsonResponse
    {
        $this->backfillMissingTenantOwners();

        $query = Tenant::with(['user:id,name,email', 'owner:id,name,email'])->latest();

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->where(function ($q) use ($ownerId) {
                $q->where('owner_id', $ownerId)
                  ->orWhere(function ($legacy) use ($ownerId) {
                      $legacy->whereNull('owner_id')
                             ->whereHas('contracts', function ($c) use ($ownerId) {
                                 $c->where('contracts.owner_id', $ownerId)
                                   ->orWhereHas('unit.property', fn ($p) => $p->where('owner_id', $ownerId));
                             });
                  });
            });
        } elseif ($request->filled('owner_id')) {
            $query->where('owner_id', (int) $request->owner_id);
        }

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(fn ($builder) => $builder->where('name', 'like', $search)
                ->orWhere('email', 'like', $search)->orWhere('contact', 'like', $search)
                ->orWhere('phone', 'like', $search)->orWhere('emirates_id', 'like', $search));
        }

        $tenants = $query->get()->map(function ($t) {
            $t->portal_enabled = (bool) $t->user_id;
            $t->has_active_lease = $this->provisioner->tenantModelHasActiveLease($t);
            return $t;
        });

        return response()->json(['status' => 'success', 'data' => ['tenants' => $tenants]]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $data['owner_id'] = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
        }

        $tenant = $this->properties->createTenant($data);
        return response()->json(['status' => 'success', 'message' => 'Tenant created.', 'data' => ['tenant' => $tenant->load(['user:id,name,email', 'owner:id,name,email'])]], 201);
    }

    public function show(Request $request, Tenant $tenant): JsonResponse
    {
        $this->assertTenantAccess($request, $tenant);
        $tenant->load(['user:id,name,email', 'owner:id,name,email', 'contracts.unit.property']);
        $tenant->portal_enabled = (bool) $tenant->user_id;
        $tenant->has_active_lease = $this->provisioner->tenantModelHasActiveLease($tenant);

        return response()->json(['status' => 'success', 'data' => ['tenant' => $tenant]]);
    }

    public function update(Request $request, Tenant $tenant): JsonResponse
    {
        $this->assertTenantAccess($request, $tenant);

        $rules = $this->rules($tenant);
        $rules['name'] = 'sometimes|string|max:255';
        $data = $request->validate($rules);

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $data['owner_id'] = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
        }

        $tenant = $this->properties->updateTenant($tenant, $data);
        return response()->json(['status' => 'success', 'message' => 'Tenant updated.', 'data' => ['tenant' => $tenant->load(['user:id,name,email', 'owner:id,name,email'])]]);
    }

    public function destroy(Request $request, Tenant $tenant): JsonResponse
    {
        $this->assertTenantAccess($request, $tenant);
        $this->properties->deleteTenant($tenant);
        return response()->json(['status' => 'success', 'message' => 'Tenant deleted.']);
    }

    /**
     * Enable portal access for an existing tenant.
     * POST /api/owner/tenants/{tenant}/portal
     */
    public function enablePortal(Request $request, Tenant $tenant): JsonResponse
    {
        $this->assertTenantAccess($request, $tenant);

        $validated = $request->validate([
            'force_password_reset' => 'nullable|boolean',
            'email'                => 'nullable|email|max:255',
        ]);

        $email = $validated['email'] ?? $tenant->email;
        if (empty($email)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tenant must have an email address to enable portal access.',
            ], 422);
        }

        $provData = [
            'tenant_id'   => $tenant->id,
            'name'        => $tenant->name,
            'email'       => $email,
            'phone'       => $tenant->phone ?: $tenant->contact,
            'emirates_id' => $tenant->emirates_id,
            'nationality' => $tenant->nationality,
            'address'     => $tenant->address,
            'owner_id'    => $tenant->owner_id,
        ];

        $forceReset = $request->boolean('force_password_reset', false);
        $prov = $this->provisioner->provision($provData, $forceReset);

        $emailSent = false;
        if (!empty($prov['password_set']) && !empty($prov['temp_password'])) {
            try {
                Mail::to($prov['user']->email)
                    ->send(new TenantPortalCredentialsMail(
                        $prov['user'],
                        $prov['temp_password']
                    ));
                $emailSent = true;
            } catch (\Throwable $e) {
                Log::warning('enablePortal mail error: ' . $e->getMessage());
                $emailSent = false;
            }
        } else {
            $emailSent = true;
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Tenant portal access enabled.',
            'data'    => [
                'tenant' => $tenant->fresh()->load(['user:id,name,email']),
                'portal' => [
                    'was_created'   => $prov['was_created'],
                    'email_sent'    => $emailSent,
                    'temp_password' => $emailSent ? null : $prov['temp_password'],
                ],
            ],
        ]);
    }

    /**
     * Reset portal password for a tenant.
     * POST /api/owner/tenants/{tenant}/portal/reset-password
     */
    public function resetPortalPassword(Request $request, Tenant $tenant): JsonResponse
    {
        $this->assertTenantAccess($request, $tenant);

        if (empty($tenant->email)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tenant must have an email address to reset portal password.',
            ], 422);
        }

        $provData = [
            'tenant_id' => $tenant->id,
            'name'      => $tenant->name,
            'email'     => $tenant->email,
            'phone'     => $tenant->phone ?: $tenant->contact,
            'owner_id'  => $tenant->owner_id,
        ];

        $prov = $this->provisioner->provision($provData, true);

        $emailSent = false;
        if (!empty($prov['temp_password'])) {
            try {
                Mail::to($prov['user']->email)
                    ->send(new TenantPortalCredentialsMail(
                        $prov['user'],
                        $prov['temp_password']
                    ));
                $emailSent = true;
            } catch (\Throwable $e) {
                Log::warning('resetPortalPassword mail error: ' . $e->getMessage());
                $emailSent = false;
            }
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Tenant portal password reset successfully.',
            'data'    => [
                'tenant' => $tenant->fresh()->load(['user:id,name,email']),
                'portal' => [
                    'was_created'   => false,
                    'email_sent'    => $emailSent,
                    'temp_password' => $emailSent ? null : $prov['temp_password'],
                ],
            ],
        ]);
    }

    private function rules(?Tenant $tenant = null): array
    {
        return [
            'user_id' => 'nullable|exists:users,id',
            'owner_id' => 'nullable|exists:owners,id',
            'name' => 'required|string|max:255', 'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500', 'contact' => 'nullable|string|max:255',
            'emirates_id' => 'nullable|string|max:255', 'phone' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:255', 'passport_number' => 'nullable|string|max:255',
        ];
    }
}
