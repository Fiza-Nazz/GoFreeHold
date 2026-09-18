<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Property\Models\Property;
use App\Domain\Property\Services\PropertyService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function __construct(private readonly PropertyService $propertyService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Property::with('owner:id,name,email');

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->where('owner_id', $ownerId);
        }

        $properties = $query->get();

        return response()->json([
            'status' => 'success',
            'data'   => ['properties' => $properties],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->merge(['owner_id' => $this->propertyService->resolveOwnerProfileId($request->integer('owner_id'))]);

        $validated = $request->validate([
            'owner_id'    => 'required|exists:owners,id',
            'name'        => 'required|string|max:255',
            'address'     => 'required|string|max:255',
            'city'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'type'        => 'nullable|in:residential,commercial,mixed',
        ]);

        $property = $this->propertyService->createProperty($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Property created successfully',
            'data'    => ['property' => $property],
        ], 201);
    }

    public function show(Property $property): JsonResponse
    {
        $property->load('owner:id,name,email');

        return response()->json([
            'status' => 'success',
            'data'   => ['property' => $property],
        ]);
    }

    public function update(Request $request, Property $property): JsonResponse
    {
        if ($request->filled('owner_id')) {
            $request->merge(['owner_id' => $this->propertyService->resolveOwnerProfileId($request->integer('owner_id'))]);
        }

        $validated = $request->validate([
            'owner_id' => 'exists:owners,id',
            'name'     => 'string|max:255',
            'address'  => 'string|max:255',
            'city'     => 'string|max:255',
            'type'     => 'in:residential,commercial,mixed',
        ]);

        $property = $this->propertyService->updateProperty($property, $validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Property updated successfully',
            'data'    => ['property' => $property],
        ]);
    }

    public function destroy(Property $property): JsonResponse
    {
        $property->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Property deleted successfully',
        ]);
    }

    public function getOwners(): JsonResponse
    {
        $ownerProfiles = $this->propertyService->syncOwnerProfiles();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'owners'         => $ownerProfiles,
                'owner_profiles' => $ownerProfiles,
            ],
        ]);
    }
}
