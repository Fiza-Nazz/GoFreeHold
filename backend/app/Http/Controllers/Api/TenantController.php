<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $query = Tenant::with('user:id,name,email')->latest();

        if ($request->filled('search')) {
            $q = '%' . $request->search . '%';
            $query->where(function ($builder) use ($q) {
                $builder->where('name', 'like', $q)
                    ->orWhere('email', 'like', $q)
                    ->orWhere('contact', 'like', $q)
                    ->orWhere('phone', 'like', $q)
                    ->orWhere('emirates_id', 'like', $q);
            });
        }

        $tenants = $query->get();

        return response()->json(['status' => 'success', 'data' => ['tenants' => $tenants]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'          => 'nullable|exists:users,id|unique:tenants,user_id',
            'name'             => 'required|string|max:255',
            'email'            => 'nullable|email|max:255',
            'address'          => 'nullable|string|max:500',
            'contact'          => 'nullable|string|max:255',
            'emirates_id'      => 'nullable|string|max:255',
            'phone'            => 'nullable|string|max:255',
            'nationality'      => 'nullable|string|max:255',
            'passport_number'  => 'nullable|string|max:255',
        ]);

        // tenants.user_id is NOT NULL in DB — require a linked user for create
        if (empty($validated['user_id'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'user_id is required to create a tenant record (links to users table).',
            ], 422);
        }

        $tenant = Tenant::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Tenant created.',
            'data'    => ['tenant' => $tenant->load('user:id,name,email')],
        ], 201);
    }

    public function show(Tenant $tenant)
    {
        $tenant->load(['user:id,name,email', 'contracts.unit.property']);

        return response()->json(['status' => 'success', 'data' => ['tenant' => $tenant]]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'user_id'          => 'nullable|exists:users,id|unique:tenants,user_id,' . $tenant->id,
            'name'             => 'sometimes|string|max:255',
            'email'            => 'nullable|email|max:255',
            'address'          => 'nullable|string|max:500',
            'contact'          => 'nullable|string|max:255',
            'emirates_id'      => 'nullable|string|max:255',
            'phone'            => 'nullable|string|max:255',
            'nationality'      => 'nullable|string|max:255',
            'passport_number'  => 'nullable|string|max:255',
        ]);

        $tenant->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Tenant updated.',
            'data'    => ['tenant' => $tenant->fresh()->load('user:id,name,email')],
        ]);
    }

    public function destroy(Tenant $tenant)
    {
        if ($tenant->contracts()->exists()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Cannot delete tenant with existing contracts.',
            ], 422);
        }

        $tenant->delete();

        return response()->json(['status' => 'success', 'message' => 'Tenant deleted.']);
    }
}
