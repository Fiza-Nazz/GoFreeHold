<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\User;
use App\Domain\Property\Models\Property;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index(): JsonResponse
    {
        $properties = Property::with('owner:id,name,email')->get();

        return response()->json([
            'status' => 'success',
            'data'   => ['properties' => $properties],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $ownerId = $request->input('owner_id');
        if ($ownerId && !Owner::where('id', $ownerId)->exists()) {
            $ownerProfile = Owner::where('user_id', $ownerId)->first();
            if ($ownerProfile) {
                $request->merge(['owner_id' => $ownerProfile->id]);
            } else {
                $user = User::find($ownerId);
                if ($user) {
                    $newOwner = Owner::create([
                        'user_id' => $user->id,
                        'name'    => $user->name,
                        'email'   => $user->email,
                    ]);
                    $request->merge(['owner_id' => $newOwner->id]);
                }
            }
        }

        $validated = $request->validate([
            'owner_id'    => 'required|exists:owners,id',
            'name'        => 'required|string|max:255',
            'address'     => 'required|string|max:255',
            'city'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'type'        => 'nullable|in:residential,commercial,mixed',
        ]);

        $property = Property::create($validated);

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
        $ownerId = $request->input('owner_id');
        if ($ownerId && !Owner::where('id', $ownerId)->exists()) {
            $ownerProfile = Owner::where('user_id', $ownerId)->first();
            if ($ownerProfile) {
                $request->merge(['owner_id' => $ownerProfile->id]);
            }
        }

        $validated = $request->validate([
            'owner_id' => 'exists:owners,id',
            'name'     => 'string|max:255',
            'address'  => 'string|max:255',
            'city'     => 'string|max:255',
            'type'     => 'in:residential,commercial,mixed',
        ]);

        $property->update($validated);

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
        $userOwners = User::where('role', 'owner')->get();
        foreach ($userOwners as $u) {
            Owner::firstOrCreate(
                ['user_id' => $u->id],
                ['name' => $u->name, 'email' => $u->email]
            );
        }

        $ownerProfiles = Owner::query()
            ->select('id', 'name', 'email', 'contact', 'user_id')
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'owners'         => $ownerProfiles,
                'owner_profiles' => $ownerProfiles,
            ],
        ]);
    }
}
