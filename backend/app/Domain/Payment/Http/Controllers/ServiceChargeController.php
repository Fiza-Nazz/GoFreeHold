<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Payment\Models\ServiceCharge;
use App\Domain\Payment\Services\ServiceChargeService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceChargeController extends Controller
{
    public function __construct(private readonly ServiceChargeService $service)
    {
    }

    /**
     * List service charges with optional filters and summary KPIs.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ServiceCharge::with([
            'contract:id,contract_number',
            'unit:id,number,property_id,owner_id,monthly_service_charge',
            'unit.property:id,name,owner_id',
            'docs',
            'payments',
        ]);

        $this->service->scopeCharges($query, $user);

        // Optional query filters
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('unit_id')) {
            $query->where('unit_id', $request->unit_id);
        }
        if ($request->filled('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }
        if ($request->filled('property_id') && $request->property_id !== 'all') {
            $query->where('property_id', $request->property_id);
        }
        if ($request->filled('owner_id') && $request->owner_id !== 'all') {
            $query->where('owner_id', $request->owner_id);
        }
        if ($request->filled('period') && $request->period !== 'all') {
            $query->whereYear('due_date', $request->period);
        }
        if ($request->filled('from')) {
            $query->whereDate('due_date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('due_date', '<=', $request->to);
        }
        if ($request->filled('q')) {
            $q = trim($request->q);
            $query->where(function ($sub) use ($q) {
                $sub->where('invoice_number', 'like', "%{$q}%")
                    ->orWhere('vendor_name', 'like', "%{$q}%")
                    ->orWhere('notes', 'like', "%{$q}%")
                    ->orWhere('charge_type', 'like', "%{$q}%")
                    ->orWhereHas('unit', function ($u) use ($q) {
                        $u->where('number', 'like', "%{$q}%")
                          ->orWhereHas('property', fn ($p) => $p->where('name', 'like', "%{$q}%"));
                    });
            });
        }

        $charges = $query->latest('due_date')->get();

        // Calculate list-level summary
        $totalBilled = 0.0;
        $totalPaid = 0.0;
        $totalWaived = 0.0;

        foreach ($charges as $c) {
            $amt = (float) $c->amount;
            if ($c->status === 'waived') {
                $totalWaived += $amt;
                continue;
            }
            $totalBilled += $amt;
            $paidSum = (float) $c->payments->sum('amount');
            if ($c->status === 'paid' && $paidSum <= 0) {
                $totalPaid += $amt;
            } else {
                $totalPaid += min($amt, $paidSum);
            }
        }

        $summary = [
            'billed'                     => round($totalBilled, 2),
            'paid'                       => round($totalPaid, 2),
            'outstanding'                => round(max(0.0, $totalBilled - $totalPaid), 2),
            'waived'                     => round($totalWaived, 2),
        ];

        return response()->json([
            'status' => 'success',
            'data'   => [
                'charges' => $charges,
                'summary' => $summary,
            ],
        ]);
    }

    /**
     * Dedicated analytics / summary endpoint.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $summary = $this->service->getSummary($user, $request->all());

        return response()->json([
            'status' => 'success',
            'data'   => $summary,
        ]);
    }

    /**
     * Show single service charge with full details.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $charge = ServiceCharge::with([
            'contract:id,contract_number',
            'unit:id,number,property_id,owner_id,monthly_service_charge',
            'unit.property:id,name,owner_id',
            'docs',
            'payments.recorder:id,name',
            'creator:id,name',
        ])->findOrFail($id);

        $this->service->assertChargeAccess($charge, $user);

        $paidTotal = (float) $charge->payments->sum('amount');
        if ($charge->status === 'paid' && $paidTotal <= 0) {
            $paidTotal = (float) $charge->amount;
        }

        $chargeArray = $charge->toArray();
        $chargeArray['paid_total'] = round($paidTotal, 2);
        $chargeArray['outstanding'] = round(max(0.0, (float) $charge->amount - $paidTotal), 2);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'charge' => $chargeArray,
            ],
        ]);
    }

    /**
     * Create a new service charge bill.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'unit_id'        => 'required|integer|exists:units,id',
            'contract_id'    => 'nullable|integer|exists:contracts,id',
            'charge_type'    => 'nullable|string|max:50',
            'amount'         => 'required|numeric|min:0.01',
            'due_date'       => 'required|date',
            'paid_date'      => 'nullable|date',
            'period_label'   => 'nullable|string|max:50',
            'period_start'   => 'nullable|date',
            'period_end'     => 'nullable|date',
            'invoice_number' => 'nullable|string|max:100',
            'vendor_name'    => 'nullable|string|max:255',
            'notes'          => 'nullable|string',
            'owner_id'       => 'nullable|integer',
            'property_id'    => 'nullable|integer',
        ]);

        // Security check: unit belongs to user's org
        $unit = $this->service->assertUnitAccess((int) $validated['unit_id'], $user);

        // Derive org, property, owner from unit if not explicitly supplied
        $orgId = $unit->organization_id ?: ($user->organization_id ?: 1);
        $propId = $validated['property_id'] ?? $unit->property_id;
        $ownerId = $validated['owner_id'] ?? ($unit->owner_id ?: $unit->property?->owner_id);

        $chargeData = array_merge($validated, [
            'organization_id' => $orgId,
            'property_id'     => $propId,
            'owner_id'        => $ownerId,
            'charge_type'     => $validated['charge_type'] ?? 'maintenance',
            'status'          => 'pending',
            'created_by'      => $user->id,
        ]);

        $charge = ServiceCharge::create($chargeData);
        $charge->load(['unit.property', 'docs', 'payments']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Service charge created.',
            'data'    => [
                'charge' => $charge,
            ],
        ], 201);
    }

    /**
     * Update charge details / mark paid / waive.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $charge = ServiceCharge::findOrFail($id);
        $this->service->assertChargeAccess($charge, $user);

        $validated = $request->validate([
            'status'         => 'nullable|string|in:pending,paid,waived,partial',
            'paid_date'      => 'nullable|date',
            'notes'          => 'nullable|string',
            'amount'         => 'nullable|numeric|min:0.01',
            'due_date'       => 'nullable|date',
            'charge_type'    => 'nullable|string|max:50',
            'period_label'   => 'nullable|string|max:50',
            'period_start'   => 'nullable|date',
            'period_end'     => 'nullable|date',
            'invoice_number' => 'nullable|string|max:100',
            'vendor_name'    => 'nullable|string|max:255',
        ]);

        // If marking paid without date, default to today
        if (isset($validated['status']) && $validated['status'] === 'paid' && empty($validated['paid_date'])) {
            $validated['paid_date'] = $charge->paid_date ?? now()->toDateString();
        }

        // If waiving, clear paid_date unless requested
        if (isset($validated['status']) && $validated['status'] === 'waived') {
            $validated['paid_date'] = null;
        }

        // Amount cannot be changed if payments exist
        if (isset($validated['amount']) && (float) $validated['amount'] !== (float) $charge->amount) {
            $hasPayments = $charge->payments()->exists();
            if ($hasPayments) {
                return response()->json([
                    'message' => 'Cannot modify amount of a service charge that has recorded payments.',
                ], 422);
            }
        }

        $charge->update($validated);
        $charge->load(['unit.property', 'docs', 'payments']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Service charge updated.',
            'data'    => [
                'charge' => $charge,
            ],
        ]);
    }

    /**
     * Delete service charge along with docs and payments.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $charge = ServiceCharge::with(['docs', 'payments'])->findOrFail($id);
        $this->service->assertChargeAccess($charge, $user);

        // Remove docs and disk files
        foreach ($charge->docs as $doc) {
            $this->service->deleteDoc($doc);
        }

        // Remove payments
        $charge->payments()->delete();

        // Delete charge
        $charge->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Service charge deleted.',
        ]);
    }
}
