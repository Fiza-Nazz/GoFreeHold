<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use Illuminate\Http\Request;

class OwnerController extends Controller
{
    public function index()
    {
        $owners = Owner::with('user:id,name,email')->latest()->get();
        return response()->json(['status' => 'success', 'data' => ['owners' => $owners]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'name'    => 'required|string|max:255',
            'contact' => 'nullable|string|max:255',
            'email'   => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        $owner = Owner::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Owner created.', 'data' => ['owner' => $owner]], 201);
    }

    public function show(Owner $owner)
    {
        $owner->load('user:id,name,email', 'properties', 'units');
        return response()->json(['status' => 'success', 'data' => ['owner' => $owner]]);
    }

    public function update(Request $request, Owner $owner)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'name'    => 'string|max:255',
            'contact' => 'nullable|string|max:255',
            'email'   => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
        ]);

        $owner->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Owner updated.', 'data' => ['owner' => $owner]]);
    }

    public function destroy(Owner $owner)
    {
        $owner->delete();
        return response()->json(['status' => 'success', 'message' => 'Owner deleted.']);
    }

    /**
     * Owner portfolio (plan: GET /api/owners/{id}/portfolio)
     */
    public function portfolio(Owner $owner)
    {
        $owner->load(['properties.units', 'units']);

        return response()->json([
            'status' => 'success',
            'data' => [
                'owner'       => $owner->only(['id', 'name', 'contact', 'email']),
                'properties'  => $owner->properties,
                'total_units' => $owner->units->count(),
                'vacant_units' => $owner->units->where('status', 'AVAILABLE')->count(),
            ],
        ]);
    }
}
