<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Payment\Models\PaymentAuditLog;
use App\Domain\Payment\Models\RentTransaction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RentTransactionController extends Controller
{
    /**
     * GET rent ledger — plan: ?month=&property_id=&tenant_id=
     * Also supports contract_id for drill-down.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RentTransaction::with([
            'contract:id,unit_id,tenant_id,rent_amount',
            'contract.unit:id,number,property_id',
            'contract.unit.property:id,name',
            'contract.tenant:id,name',
        ]);

        if ($request->filled('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }

        // Plan filter: month (YYYY-MM)
        $month = $request->query('month', $request->query('month_year'));
        if ($month) {
            $query->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$month]);
        }

        if ($request->filled('property_id')) {
            $propertyId = $request->property_id;
            $query->whereHas('contract.unit', fn ($q) => $q->where('property_id', $propertyId));
        }

        if ($request->filled('tenant_id')) {
            $query->whereHas('contract', fn ($q) => $q->where('tenant_id', $request->tenant_id));
        }

        $entries = $query->orderByDesc('date')->orderByDesc('id')->get();

        $totalDebit = (float) $entries->sum('debit');
        $totalCredit = (float) $entries->sum('credit');

        return response()->json([
            'status' => 'success',
            'data'   => [
                'entries' => $entries,
                'summary' => [
                    'total_debit'   => $totalDebit,
                    'total_credit'  => $totalCredit,
                    'total_balance' => $totalDebit - $totalCredit,
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'date'        => 'required|date',
            'description' => 'nullable|string|max:500',
            'debit'       => 'nullable|numeric|min:0',
            'credit'      => 'nullable|numeric|min:0',
        ]);

        $debit = (float) ($validated['debit'] ?? 0);
        $credit = (float) ($validated['credit'] ?? 0);

        if ($debit <= 0 && $credit <= 0) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Provide a positive debit and/or credit amount.',
            ], 422);
        }

        $entry = RentTransaction::create([
            'contract_id' => $validated['contract_id'],
            'date'        => $validated['date'],
            'description' => $validated['description'] ?? null,
            'debit'       => $debit,
            'credit'      => $credit,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Ledger entry created.',
            'data'    => ['entry' => $entry->load('contract.tenant:id,name')],
        ], 201);
    }

    public function show(RentTransaction $rentTransaction): JsonResponse
    {
        $rentTransaction->load(['contract.unit.property', 'contract.tenant:id,name']);

        return response()->json(['status' => 'success', 'data' => ['entry' => $rentTransaction]]);
    }

    public function update(Request $request, RentTransaction $rentTransaction): JsonResponse
    {
        $validated = $request->validate([
            'date'        => 'sometimes|date',
            'description' => 'nullable|string|max:500',
            'debit'       => 'nullable|numeric|min:0',
            'credit'      => 'nullable|numeric|min:0',
        ]);

        $rentTransaction->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Ledger entry updated.',
            'data'    => ['entry' => $rentTransaction],
        ]);
    }

    /**
     * Receivables = contracts where SUM(debit) - SUM(credit) > 0
     */
    public function receivablesSummary(): JsonResponse
    {
        $rows = RentTransaction::query()
            ->selectRaw('contract_id, SUM(debit) as total_debit, SUM(credit) as total_credit, (SUM(debit) - SUM(credit)) as total_outstanding')
            ->groupBy('contract_id')
            ->havingRaw('(SUM(debit) - SUM(credit)) > 0')
            ->with(['contract.unit.property', 'contract.tenant:id,name'])
            ->get();

        return response()->json(['status' => 'success', 'data' => ['receivables' => $rows]]);
    }

    /**
     * Soft-delete with audit trail (never hard-delete operational ledger rows).
     */
    public function softDelete(Request $request, RentTransaction $rentTransaction): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:5',
        ]);

        PaymentAuditLog::create([
            'ledger_id'    => $rentTransaction->id,
            'action'       => 'deleted',
            'reason'       => $request->reason,
            'performed_by' => $request->user()->id,
            'snapshot'     => $rentTransaction->toArray(),
        ]);

        $rentTransaction->deleted_by = $request->user()->id;
        $rentTransaction->deletion_reason = $request->reason;
        $rentTransaction->save();
        $rentTransaction->delete(); // SoftDeletes

        return response()->json([
            'status'  => 'success',
            'message' => 'Ledger entry soft-deleted. Audit log recorded.',
        ]);
    }

    public function auditLog(int $rentTransaction): JsonResponse
    {
        // Soft-deleted ledger rows must still expose their audit trail
        $entry = RentTransaction::withTrashed()->findOrFail($rentTransaction);

        $logs = PaymentAuditLog::where('ledger_id', $entry->id)
            ->with('performedBy:id,name')
            ->latest()
            ->get();

        return response()->json(['status' => 'success', 'data' => ['logs' => $logs]]);
    }

    public function destroy(RentTransaction $rentTransaction): JsonResponse
    {
        // Prefer softDelete with reason; hard destroy only if already soft-deleted force
        $rentTransaction->forceDelete();

        return response()->json(['status' => 'success', 'message' => 'Ledger entry permanently removed.']);
    }
}