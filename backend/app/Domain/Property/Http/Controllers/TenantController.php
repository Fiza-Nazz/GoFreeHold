<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Property\Services\PropertyService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function __construct(private readonly PropertyService $properties)
    {
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

    public function index(Request $request)
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
        return response()->json(['status' => 'success', 'data' => ['tenants' => $query->get()]]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $data['owner_id'] = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
        }

        $tenant = $this->properties->createTenant($data);
        return response()->json(['status' => 'success', 'message' => 'Tenant created.', 'data' => ['tenant' => $tenant->load(['user:id,name,email', 'owner:id,name,email'])]], 201);
    }

    public function show(Request $request, Tenant $tenant)
    {
        $this->assertTenantAccess($request, $tenant);
        return response()->json(['status' => 'success', 'data' => ['tenant' => $tenant->load(['user:id,name,email', 'owner:id,name,email', 'contracts.unit.property'])]]);
    }

    public function update(Request $request, Tenant $tenant)
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

    public function destroy(Request $request, Tenant $tenant)
    {
        $this->assertTenantAccess($request, $tenant);
        $this->properties->deleteTenant($tenant);
        return response()->json(['status' => 'success', 'message' => 'Tenant deleted.']);
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
