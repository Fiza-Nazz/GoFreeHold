<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Payment\Models\ServiceCharge;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * FLAG — PENDING CLIENT CONFIRMATION (Step 10):
 * store()/index() require and filter by both contract_id and unit_id because
 * the table currently has BOTH FKs. Once the client confirms which FK is
 * canonical, narrow validation/filters — do not remove columns silently.
 */
class ServiceChargeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ServiceCharge::with(['contract:id', 'unit:id,number,property_id', 'unit.property:id,name']);

        if ($request->has('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }
        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(['status' => 'success', 'data' => ['charges' => $query->latest('due_date')->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        // Both FKs required for now — see class-level FLAG above.
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'unit_id'     => 'required|exists:units,id',
            'charge_type' => 'required|in:maintenance,utilities,cleaning,security,other',
            'amount'      => 'required|numeric|min:1',
            'due_date'    => 'required|date',
            'notes'       => 'nullable|string',
        ]);

        $validated['status'] = 'pending';
        $charge = ServiceCharge::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Service charge added.', 'data' => ['charge' => $charge]], 201);
    }

    public function update(Request $request, ServiceCharge $serviceCharge): JsonResponse
    {
        $validated = $request->validate([
            'status'    => 'in:pending,paid,waived',
            'paid_date' => 'nullable|date',
            'notes'     => 'nullable|string',
        ]);

        $serviceCharge->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Service charge updated.', 'data' => ['charge' => $serviceCharge]]);
    }

    public function destroy(ServiceCharge $serviceCharge): JsonResponse
    {
        $serviceCharge->delete();

        return response()->json(['status' => 'success', 'message' => 'Service charge deleted.']);
    }
}