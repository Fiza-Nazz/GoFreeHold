<?php

namespace App\Domain\Maintenance\Http\Controllers;

use App\Domain\Maintenance\Models\Appliance;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplianceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Appliance::with('unit:id,number,property_id', 'unit.property:id,name');

        if ($request->has('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }

        return response()->json(['status' => 'success', 'data' => ['appliances' => $query->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        // Real DB: model (not model_number). Draft fields accepted then stripped.
        $validated = $request->validate([
            'unit_id'         => 'required|exists:units,id',
            'name'            => 'required|string|max:255',
            'brand'           => 'required|string|max:255',
            'model'           => 'nullable|string|max:255',
            'model_number'    => 'nullable|string|max:255', // FE alias → model
            'serial_number'   => 'nullable|string|max:255',
            'purchase_date'   => 'nullable|date',
            // FLAG: not in DB yet — accepted for UI compatibility, not persisted
            'warranty_expiry' => 'nullable|date',
            'condition'       => 'nullable|in:brand_new,good,needs_repair,replaced',
            'notes'           => 'nullable|string',
        ]);

        $payload = [
            'unit_id'       => $validated['unit_id'],
            'name'          => $validated['name'],
            'brand'         => $validated['brand'],
            'model'         => $validated['model'] ?? $validated['model_number'] ?? null,
            'serial_number' => $validated['serial_number'] ?? null,
            'purchase_date' => $validated['purchase_date'] ?? null,
        ];

        $appliance = Appliance::create($payload);

        return response()->json([
            'status'  => 'success',
            'message' => 'Appliance added to catalog.',
            'data'    => ['appliance' => $appliance->load('unit.property')],
        ], 201);
    }

    public function show(Appliance $appliance): JsonResponse
    {
        $appliance->load('unit.property');

        return response()->json(['status' => 'success', 'data' => ['appliance' => $appliance]]);
    }

    public function update(Request $request, Appliance $appliance): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'string|max:255',
            'brand'         => 'string|max:255',
            'model'         => 'nullable|string|max:255',
            'model_number'  => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            // FLAG draft extras — not persisted
            'warranty_expiry' => 'nullable|date',
            'condition'       => 'nullable|in:brand_new,good,needs_repair,replaced',
            'notes'           => 'nullable|string',
        ]);

        $payload = array_filter([
            'name'          => $validated['name'] ?? null,
            'brand'         => $validated['brand'] ?? null,
            'model'         => $validated['model'] ?? $validated['model_number'] ?? null,
            'serial_number' => $validated['serial_number'] ?? null,
            'purchase_date' => $validated['purchase_date'] ?? null,
        ], fn ($v) => $v !== null);

        $appliance->update($payload);

        return response()->json(['status' => 'success', 'message' => 'Appliance updated.', 'data' => ['appliance' => $appliance]]);
    }

    public function destroy(Appliance $appliance): JsonResponse
    {
        $appliance->delete();

        return response()->json(['status' => 'success', 'message' => 'Appliance removed.']);
    }
}
