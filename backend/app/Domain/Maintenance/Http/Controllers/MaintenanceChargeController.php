<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\MaintenanceCharge;
use Illuminate\Http\Request;

class MaintenanceChargeController extends Controller
{
    public function index(Request $request)
    {
        $query = MaintenanceCharge::with(['job:id,complaint_id,status', 'unit:id,number']);

        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(['status' => 'success', 'data' => ['charges' => $query->latest()->get()]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_id'      => 'nullable|exists:jobs,id',
            'unit_id'     => 'nullable|exists:units,id',
            'description' => 'nullable|string|max:500',
            'amount'      => 'required|numeric|min:0',
            'status'      => 'nullable|in:pending,billed,paid',
        ]);

        $charge = MaintenanceCharge::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Maintenance charge created.', 'data' => ['charge' => $charge]], 201);
    }

    public function show(MaintenanceCharge $maintenanceCharge)
    {
        return response()->json(['status' => 'success', 'data' => ['charge' => $maintenanceCharge->load('job', 'unit')]]);
    }

    public function update(Request $request, MaintenanceCharge $maintenanceCharge)
    {
        $validated = $request->validate([
            'description' => 'nullable|string|max:500',
            'amount'      => 'numeric|min:0',
            'status'      => 'in:pending,billed,paid',
        ]);

        $maintenanceCharge->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Maintenance charge updated.', 'data' => ['charge' => $maintenanceCharge]]);
    }

    public function destroy(MaintenanceCharge $maintenanceCharge)
    {
        $maintenanceCharge->delete();
        return response()->json(['status' => 'success', 'message' => 'Maintenance charge deleted.']);
    }
}
