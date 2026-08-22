<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\PaymentAuditLog;
use App\Domain\Payment\Models\RentTransaction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with([
            'contract:id,unit_id',
            'tenant:id,name',
            'recordedBy:id,name',
        ]);

        if ($request->has('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        // Backward-compatible alias until frontend Step 11
        if ($request->has('category')) {
            $query->where('type', $request->category);
        }
        if ($request->has('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        $payments = $query->latest('date')->get();

        return response()->json(['status' => 'success', 'data' => ['payments' => $payments]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id'      => 'required|exists:contracts,id',
            'tenant_id'        => 'required|exists:tenants,id',
            'type'             => 'required_without:category|in:rent,dewa,deposit,settlement,service_charge,other',
            'category'         => 'required_without:type|in:rent,dewa,deposit,settlement,service_charge,other',
            'mode'             => 'required|in:cash,card,bank_transfer,cheque,online',
            'amount'           => 'required|numeric|min:1',
            'date'             => 'required_without:payment_date|date',
            'payment_date'     => 'required_without:date|date',
            'due_date'         => 'nullable|date',
            'reference_number' => 'nullable|string|max:100',
            'remarks'          => 'nullable|string',
            'notes'            => 'nullable|string',
        ]);

        $payload = [
            'contract_id'      => $validated['contract_id'],
            'tenant_id'        => $validated['tenant_id'],
            'type'             => $validated['type'] ?? $validated['category'],
            'mode'             => $validated['mode'],
            'amount'           => $validated['amount'],
            'date'             => $validated['date'] ?? $validated['payment_date'],
            'due_date'         => $validated['due_date'] ?? null,
            'reference_number' => $validated['reference_number'] ?? null,
            'remarks'          => $validated['remarks'] ?? $validated['notes'] ?? null,
            'recorded_by'      => $request->user()->id,
        ];

        $payment = DB::transaction(function () use ($payload) {
            $payment = Payment::create($payload);

            // Contract ledger (rent_transactions): credit for EVERY payment type so
            // Admin sees full tenant payment history, not rent-only.
            $typeLabel = strtoupper(str_replace('_', ' ', $payment->type));
            $description = $typeLabel . ' payment'
                . (! empty($payment->reference_number) ? ' ref ' . $payment->reference_number : '');

            RentTransaction::create([
                'contract_id' => $payment->contract_id,
                'payment_id'  => $payment->id,
                'date'        => $payment->date,
                'description' => $description,
                'debit'       => 0,
                'credit'      => $payment->amount,
            ]);

            return $payment;
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Payment recorded successfully.',
            'data'    => ['payment' => $payment->load(['tenant:id,name', 'recordedBy:id,name'])],
        ], 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['contract.unit.property', 'tenant', 'recordedBy']);

        return response()->json(['status' => 'success', 'data' => ['payment' => $payment]]);
    }

    /**
     * Soft-delete a payment with audit trail, and reverse any linked ledger credit.
     */
    public function destroy(Request $request, Payment $payment): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:5',
        ]);

        DB::transaction(function () use ($request, $payment) {
            $linked = RentTransaction::where('payment_id', $payment->id)
                ->where('credit', '>', 0)
                ->get();

            foreach ($linked as $ledger) {
                PaymentAuditLog::create([
                    'ledger_id'    => $ledger->id,
                    'payment_id'   => $payment->id,
                    'action'       => 'deleted',
                    'reason'       => $request->reason . ' (linked ledger credit reversed with payment)',
                    'performed_by' => $request->user()->id,
                    'snapshot'     => $ledger->toArray(),
                ]);

                $ledger->deleted_by = $request->user()->id;
                $ledger->deletion_reason = $request->reason;
                $ledger->save();
                $ledger->delete();
            }

            PaymentAuditLog::create([
                'ledger_id'    => $linked->first()?->id,
                'payment_id'   => $payment->id,
                'action'       => 'deleted',
                'reason'       => $request->reason,
                'performed_by' => $request->user()->id,
                'snapshot'     => array_merge($payment->toArray(), [
                    'entity'            => 'payment',
                    'linked_ledger_ids' => $linked->pluck('id')->values()->all(),
                ]),
            ]);

            $payment->deleted_by = $request->user()->id;
            $payment->deletion_reason = $request->reason;
            $payment->save();
            $payment->delete();
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Payment soft-deleted. Audit log recorded; linked ledger credit reversed.',
        ]);
    }
}
