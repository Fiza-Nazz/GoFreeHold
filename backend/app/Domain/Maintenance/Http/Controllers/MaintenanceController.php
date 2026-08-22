<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\Maintenance;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Maintenance::with('unit:id,number');

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

        $maintenance = Maintenance::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Maintenance record created.', 'data' => ['maintenance' => $maintenance]], 201);
    }

    public function show(Maintenance $maintenance)
    {
        return response()->json(['status' => 'success', 'data' => ['maintenance' => $maintenance->load('unit')]]);
    }

    public function update(Request $request, Maintenance $maintenance)
    {
        $validated = $request->validate([
            'unit_id'     => 'nullable|exists:units,id',
            'date'        => 'date',
            'description' => 'nullable|string',
            'cost'        => 'nullable|numeric|min:0',
        ]);

        $maintenance->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Maintenance record updated.', 'data' => ['maintenance' => $maintenance]]);
    }

    public function destroy(Maintenance $maintenance)
    {
        $maintenance->delete();
        return response()->json(['status' => 'success', 'message' => 'Maintenance record deleted.']);
    }
}
