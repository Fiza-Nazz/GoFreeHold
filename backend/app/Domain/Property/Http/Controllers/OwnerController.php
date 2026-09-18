<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Auth\Models\Owner;
use App\Domain\Property\Services\PropertyService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class OwnerController extends Controller
{
    public function __construct(private readonly PropertyService $properties)
    {
    }

    public function index()
    {
        return response()->json(['status' => 'success', 'data' => ['owners' => Owner::with('user:id,name,email')->latest()->get()]]);
    }

    public function store(Request $request)
    {
        $owner = $this->properties->createOwner($request->validate([
            'user_id' => 'nullable|exists:users,id', 'name' => 'required|string|max:255',
            'contact' => 'nullable|string|max:255', 'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
        ]));
        return response()->json(['status' => 'success', 'message' => 'Owner created.', 'data' => ['owner' => $owner]], 201);
    }

    public function show(Owner $owner)
    {
        return response()->json(['status' => 'success', 'data' => ['owner' => $owner->load('user:id,name,email', 'properties', 'units')]]);
    }

    public function update(Request $request, Owner $owner)
    {
        $owner = $this->properties->updateOwner($owner, $request->validate([
            'user_id' => 'nullable|exists:users,id', 'name' => 'string|max:255',
            'contact' => 'nullable|string|max:255', 'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
        ]));
        return response()->json(['status' => 'success', 'message' => 'Owner updated.', 'data' => ['owner' => $owner]]);
    }

    public function destroy(Owner $owner)
    {
        $owner->delete();
        return response()->json(['status' => 'success', 'message' => 'Owner deleted.']);
    }

    public function portfolio(Owner $owner)
    {
        $owner->load(['properties.units', 'units']);
        return response()->json(['status' => 'success', 'data' => [
            'owner' => $owner->only(['id', 'name', 'contact', 'email']),
            'properties' => $owner->properties,
            'total_units' => $owner->units->count(),
            'vacant_units' => $owner->units->where('status', 'AVAILABLE')->count(),
        ]]);
    }
}
