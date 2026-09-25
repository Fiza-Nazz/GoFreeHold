<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Services\PaymentService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with([
            'contract:id,unit_id,owner_id',
            'tenant:id,name',
            'recordedBy:id,name',
        ]);

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->whereHas('contract', function ($q) use ($ownerId) {
                $q->where('contracts.owner_id', $ownerId)
                  ->orWhereHas('unit.property', fn ($p) => $p->where('owner_id', $ownerId));
            });
        }

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

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $contract = \App\Domain\Contract\Models\Contract::findOrFail($payload['contract_id']);
            $contractOwnerId = (int) ($contract->owner_id ?: $contract->unit?->property?->owner_id);
            abort_unless($contractOwnerId === (int) $ownerId, 403, 'Unauthorized access to this contract.');
        }

        $payment = app(PaymentService::class)->recordPayment($payload);

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
        $user = $request->user();
        abort_if($user?->role === 'cashier', 403, 'Cashiers are not authorized to delete existing payment records.');
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $contractOwnerId = (int) ($payment->contract?->owner_id ?: $payment->contract?->unit?->property?->owner_id);
            abort_unless($contractOwnerId === (int) $ownerId, 403, 'Unauthorized access to this payment.');
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $reason = $validated['reason'];

        app(PaymentService::class)->deletePayment($payment, $reason, $request->user()->id);

        return response()->json([
            'status'  => 'success',
            'message' => 'Payment soft-deleted. Audit log recorded; linked ledger credit reversed.',
        ]);
    }
}
