<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Property\Http\Requests\StoreUnitRequest;
use App\Domain\Property\Models\Unit;
use App\Domain\Property\Services\PropertyService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('units', 'public');
        }

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
            'property_id'            => 'sometimes|required|exists:properties,id',
            'number'                 => 'string|max:50',
            'dhewa_no'               => 'nullable|string|max:100',
            'category'               => 'nullable|string|max:100',
            'floor'                  => 'integer',
            'type'                   => 'string|max:50',
            'size'                   => 'nullable|numeric',
            'furnished'              => 'boolean',
            'price'                  => 'numeric|min:0',
            'monthly_service_charge' => 'nullable|numeric|min:0',
            'status'                 => 'in:AVAILABLE,BOOKED,OCCUPIED,SOLD',
            'image'                  => 'nullable',
        ]);

        if ($request->hasFile('image')) {
            if ($unit->image && !str_starts_with($unit->image, 'http') && Storage::disk('public')->exists($unit->image)) {
                Storage::disk('public')->delete($unit->image);
            }
            $validated['image'] = $request->file('image')->store('units', 'public');
        } elseif ($request->exists('image')) {
            $validated['image'] = $request->input('image');
        }

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
            'property_id'            => 'required|exists:properties,id',
            'number'                 => 'required|string|max:50',
            'dhewa_no'               => 'nullable|string|max:100',
            'category'               => 'nullable|string|max:100',
            'floor'                  => 'required|integer',
            'type'                   => 'required|string|max:50',
            'size'                   => 'required|numeric|min:0',
            'furnished'              => 'nullable|boolean',
            'price'                  => 'required|numeric|min:0',
            'monthly_service_charge' => 'nullable|numeric|min:0',
            'status'                 => 'nullable|in:AVAILABLE,BOOKED,OCCUPIED,SOLD',
            'image'                  => 'nullable',
        ]);

        $property = \App\Domain\Property\Models\Property::findOrFail($validated['property_id']);
        if ((int) $property->owner_id !== (int) $ownerId) {
            abort(403, 'You do not own this property.');
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('units', 'public');
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

        $unit->loadMissing('property');
        $ownsUnit = ((int) $unit->owner_id === (int) $ownerId)
            || ($unit->property && (int) $unit->property->owner_id === (int) $ownerId);

        if (!$ownsUnit) {
            abort(403, 'You do not own this unit.');
        }

        $validated = $request->validate([
            'property_id'            => 'sometimes|required|exists:properties,id',
            'number'                 => 'sometimes|required|string|max:50',
            'dhewa_no'               => 'nullable|string|max:100',
            'category'               => 'nullable|string|max:100',
            'floor'                  => 'sometimes|required|integer',
            'type'                   => 'sometimes|required|string|max:50',
            'size'                   => 'nullable|numeric|min:0',
            'furnished'              => 'nullable|boolean',
            'price'                  => 'sometimes|required|numeric|min:0',
            'monthly_service_charge' => 'nullable|numeric|min:0',
            'status'                 => 'nullable|in:AVAILABLE,BOOKED,OCCUPIED,SOLD',
            'image'                  => 'nullable',
        ]);

        if (isset($validated['property_id'])) {
            $targetProperty = \App\Domain\Property\Models\Property::findOrFail($validated['property_id']);
            if ((int) $targetProperty->owner_id !== (int) $ownerId) {
                abort(403, 'You do not own the selected property.');
            }
        }

        if ($request->hasFile('image')) {
            if ($unit->image && !str_starts_with($unit->image, 'http') && Storage::disk('public')->exists($unit->image)) {
                Storage::disk('public')->delete($unit->image);
            }
            $validated['image'] = $request->file('image')->store('units', 'public');
        } elseif ($request->exists('image')) {
            $validated['image'] = $request->input('image');
        }

        $unit->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Unit updated successfully',
            'data'    => ['unit' => $unit],
        ]);
    }

    public function destroyForOwner(Request $request, Unit $unit): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        $unit->loadMissing('property');
        $ownsUnit = ((int) $unit->owner_id === (int) $ownerId)
            || ($unit->property && (int) $unit->property->owner_id === (int) $ownerId);

        if (!$ownsUnit) {
            abort(403, 'You do not own this unit.');
        }

        $this->propertyService->deleteUnit($unit);

        return response()->json([
            'status'  => 'success',
            'message' => 'Unit deleted successfully',
        ]);
    }

    public function getImages(Unit $unit): JsonResponse
    {
        $images = [];
        if ($unit->image) {
            $images[] = [
                'id'        => 1,
                'unit_id'   => $unit->id,
                'file_name' => basename($unit->image),
                'file_path' => $unit->image,
                'url'       => $unit->image_url,
                'image_url' => $unit->image_url,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data'   => ['images' => $images],
        ]);
    }

    public function uploadImage(Request $request, Unit $unit): JsonResponse
    {
        $request->validate([
            'image'    => 'nullable|file|image|max:10240',
            'images'   => 'nullable',
            'images.*' => 'nullable|file|image|max:10240',
        ]);

        $file = $request->file('image')
            ?? ($request->file('images') ? (is_array($request->file('images')) ? $request->file('images')[0] : $request->file('images')) : null);

        if ($file) {
            if ($unit->image && !str_starts_with($unit->image, 'http') && Storage::disk('public')->exists($unit->image)) {
                Storage::disk('public')->delete($unit->image);
            }
            $path = $file->store('units', 'public');
            $unit->update(['image' => $path]);
        } elseif ($request->filled('image')) {
            $unit->update(['image' => $request->input('image')]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Unit image uploaded successfully',
            'data'    => [
                'unit'      => $unit,
                'image'     => $unit->image,
                'image_url' => $unit->image_url,
                'images'    => $unit->image ? [[
                    'id'        => 1,
                    'unit_id'   => $unit->id,
                    'file_name' => basename($unit->image),
                    'file_path' => $unit->image,
                    'url'       => $unit->image_url,
                    'image_url' => $unit->image_url,
                ]] : [],
            ],
        ]);
    }

    public function deleteImage(Unit $unit): JsonResponse
    {
        if ($unit->image && !str_starts_with($unit->image, 'http') && Storage::disk('public')->exists($unit->image)) {
            Storage::disk('public')->delete($unit->image);
        }
        $unit->update(['image' => null]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Unit image removed successfully',
            'data'    => ['unit' => $unit],
        ]);
    }
}

