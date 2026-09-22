<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\Maintenance;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    private function assertUnitAccess(Request $request, ?int $unitId): void
    {
        if (!$unitId) return;
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $unit = \App\Domain\Property\Models\Unit::with('property')->find($unitId);
            abort_unless($unit, 404, 'Unit not found.');
            $unitOwnerId = (int) ($unit->owner_id ?: $unit->property?->owner_id);
            abort_unless($unitOwnerId === (int) $ownerId, 403, 'Unauthorized access to this unit.');
        }
    }

    public function index(Request $request)
    {
        $query = Maintenance::with('unit:id,number');

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->whereHas('unit', function ($u) use ($ownerId) {
                $u->where('owner_id', $ownerId)
                  ->orWhereHas('property', fn ($p) => $p->where('owner_id', $ownerId));
            });
        }

        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        return response()->json(['status' => 'success', 'data' => ['maintenances' => $query->latest('date')->get()]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id'     => 'nullable|exists:units,id',
            'date'        => 'required|date',
            'description' => 'nullable|string',
            'cost'        => 'nullable|numeric|min:0',
        ]);

        $this->assertUnitAccess($request, isset($validated['unit_id']) ? (int) $validated['unit_id'] : null);
        $maintenance = Maintenance::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Maintenance record created.', 'data' => ['maintenance' => $maintenance]], 201);
    }

    public function show(Request $request, Maintenance $maintenance)
    {
        $this->assertUnitAccess($request, $maintenance->unit_id ? (int) $maintenance->unit_id : null);
        return response()->json(['status' => 'success', 'data' => ['maintenance' => $maintenance->load('unit')]]);
    }

    public function update(Request $request, Maintenance $maintenance)
    {
        $this->assertUnitAccess($request, $maintenance->unit_id ? (int) $maintenance->unit_id : null);
        $validated = $request->validate([
            'unit_id'     => 'nullable|exists:units,id',
            'date'        => 'date',
            'description' => 'nullable|string',
            'cost'        => 'nullable|numeric|min:0',
        ]);

        if (isset($validated['unit_id'])) {
            $this->assertUnitAccess($request, (int) $validated['unit_id']);
        }

        $maintenance->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Maintenance record updated.', 'data' => ['maintenance' => $maintenance]]);
    }

    public function destroy(Request $request, Maintenance $maintenance)
    {
        $this->assertUnitAccess($request, $maintenance->unit_id ? (int) $maintenance->unit_id : null);
        $maintenance->delete();
        return response()->json(['status' => 'success', 'message' => 'Maintenance record deleted.']);
    }
}
