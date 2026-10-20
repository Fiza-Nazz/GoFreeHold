<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Payment\Models\ServiceCharge;
use App\Domain\Payment\Models\ServiceChargePayment;
use App\Domain\Payment\Services\ServiceChargeService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceChargePaymentController extends Controller
{
    public function __construct(private readonly ServiceChargeService $service)
    {
    }

    /**
     * List payments for service charges.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ServiceChargePayment::with([
            'serviceCharge:id,charge_type,amount,status,organization_id,owner_id,property_id,unit_id',
            'recorder:id,name',
        ]);

        if ($request->filled('service_charge_id')) {
            $charge = ServiceCharge::findOrFail((int) $request->service_charge_id);
            $this->service->assertChargeAccess($charge, $user);
            $query->where('service_charge_id', $charge->id);
        } else {
            // Scope by user's accessible charges
            $chargeIds = ServiceCharge::query();
            $this->service->scopeCharges($chargeIds, $user);
            $query->whereIn('service_charge_id', $chargeIds->select('id'));
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'payments' => $query->latest('payment_date')->get(),
            ],
        ]);
    }

    /**
     * Record a payment against an OA/PM service charge bill.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'service_charge_id' => 'required|integer|exists:service_charges,id',
            'amount'            => 'required|numeric|min:0.01',
            'payment_date'      => 'required|date',
            'payment_method'    => 'required|string|max:100',
            'reference_number'  => 'nullable|string|max:100',
            'remarks'           => 'nullable|string',
            'remark'            => 'nullable|string',
        ]);

        $charge = ServiceCharge::findOrFail((int) $validated['service_charge_id']);
        $this->service->assertChargeAccess($charge, $user);

        if ($charge->status === 'waived') {
            return response()->json([
                'message' => 'Cannot record payment on a waived service charge.',
            ], 422);
        }

        $existingTotal = (float) $charge->payments()->sum('amount');
        $newAmount = (float) $validated['amount'];
        $chargeAmount = (float) $charge->amount;

        // Prevent overpayment
        if (($existingTotal + $newAmount) > ($chargeAmount + 0.01)) {
            $remaining = max(0.0, $chargeAmount - $existingTotal);
            return response()->json([
                'message' => "Payment amount (AED {$newAmount}) exceeds outstanding balance (AED {$remaining}).",
            ], 422);
        }

        $remarkText = $validated['remarks'] ?? $validated['remark'] ?? null;

        $payment = DB::transaction(function () use ($charge, $validated, $newAmount, $remarkText, $user) {
            $createdPayment = ServiceChargePayment::create([
                'service_charge_id' => $charge->id,
                'amount'            => $newAmount,
                'payment_date'      => $validated['payment_date'],
                'payment_method'    => $validated['payment_method'],
                'reference_number'  => $validated['reference_number'] ?? null,
                'remarks'           => $remarkText,
                'remark'            => $remarkText,
                'recorded_by'       => $user->id,
            ]);

            // Auto-recalculate status and paid_date
            $charge->refreshStatus();

            return $createdPayment;
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Service charge payment recorded.',
            'data'    => [
                'payment' => $payment->load('recorder:id,name'),
                'charge'  => $charge->fresh(['unit.property', 'docs', 'payments']),
            ],
        ], 201);
    }

    /**
     * Delete payment and recalculate parent service charge status.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $payment = ServiceChargePayment::with('serviceCharge')->findOrFail($id);
        $charge = $payment->serviceCharge;

        if ($charge) {
            $this->service->assertChargeAccess($charge, $user);
        }

        DB::transaction(function () use ($payment, $charge) {
            $payment->delete();
            if ($charge) {
                $charge->refreshStatus();
            }
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Service charge payment deleted.',
        ]);
    }
}
