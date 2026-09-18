<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Property\Http\Requests\StoreUnitRequest;
use App\Domain\Property\Models\Unit;
use App\Domain\Property\Services\PropertyService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function __construct(private readonly PropertyService $propertyService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Unit::with(['property:id,name,owner_id', 'owner:id,name']);

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->where(function ($q) use ($ownerId) {
                $q->where('units.owner_id', $ownerId)
                  ->orWhereHas('property', fn ($p) => $p->where('owner_id', $ownerId));
            });
        }

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }
        if ($request->has('building_id')) {
            $query->where('property_id', $request->building_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'status' => 'success',
            'data'   => ['units' => $query->get()],
        ]);
    }

    public function store(StoreUnitRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $unit = $this->propertyService->createUnit($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Unit created successfully',
            'data'    => ['unit' => $unit],
        ], 201);
    }

    public function show(Unit $unit): JsonResponse
    {
        $unit->load(['property:id,name', 'owner:id,name']);

        return response()->json([
            'status' => 'success',
            'data'   => ['unit' => $unit],
        ]);
    }

    public function update(Request $request, Unit $unit): JsonResponse
    {
        $validated = $request->validate([
            'number'    => 'string|max:50',
            'dhewa_no'  => 'nullable|string|max:100',
            'category'  => 'nullable|string|max:100',
            'floor'     => 'integer',
            'type'      => 'string|max:50',
            'size'      => 'nullable|numeric',
            'furnished' => 'boolean',
            'price'     => 'numeric|min:0',
            'status'    => 'in:AVAILABLE,BOOKED,OCCUPIED,SOLD',
        ]);

        $unit->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Unit updated successfully',
            'data'    => ['unit' => $unit],
        ]);
    }

    public function destroy(Unit $unit): JsonResponse
    {
        $this->propertyService->deleteUnit($unit);

        return response()->json([
            'status'  => 'success',
            'message' => 'Unit deleted successfully',
        ]);
    }

    public function storeForOwner(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'number'      => 'required|string|max:50',
            'dhewa_no'    => 'nullable|string|max:100',
            'category'    => 'nullable|string|max:100',
            'floor'       => 'required|integer',
            'type'        => 'required|string|max:50',
            'size'        => 'required|numeric|min:0',
            'furnished'   => 'nullable|boolean',
            'price'       => 'required|numeric|min:0',
            'status'      => 'nullable|in:AVAILABLE,BOOKED,OCCUPIED,SOLD',
        ]);

        $property = \App\Domain\Property\Models\Property::findOrFail($validated['property_id']);
        if ((int) $property->owner_id !== $ownerId) {
            abort(403, 'You do not own this property.');
        }

        $validated['owner_id'] = $ownerId;
        $unit = $this->propertyService->createUnit($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Unit created successfully',
            'data'    => ['unit' => $unit],
        ], 201);
    }

    public function updateForOwner(Request $request, Unit $unit): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        if ((int) $unit->owner_id !== $ownerId) {
            abort(403, 'You do not own this unit.');
        }

        $validated = $request->validate([
            'number'    => 'sometimes|required|string|max:50',
            'dhewa_no'  => 'nullable|string|max:100',
            'category'  => 'nullable|string|max:100',
            'floor'     => 'sometimes|required|integer',
            'type'      => 'sometimes|required|string|max:50',
            'size'      => 'nullable|numeric|min:0',
            'furnished' => 'nullable|boolean',
            'price'     => 'sometimes|required|numeric|min:0',
            'status'    => 'nullable|in:AVAILABLE,BOOKED,OCCUPIED,SOLD',
        ]);

        $unit->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Unit updated successfully',
            'data'    => ['unit' => $unit],
        ]);
    }
}
