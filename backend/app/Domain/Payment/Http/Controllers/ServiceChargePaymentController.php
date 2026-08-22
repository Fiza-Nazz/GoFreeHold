<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Payment\Models\ServiceChargePayment;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceChargePaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ServiceChargePayment::with('serviceCharge:id,charge_type,amount,status');

        if ($request->has('service_charge_id')) {
            $query->where('service_charge_id', $request->service_charge_id);
        }

        return response()->json(['status' => 'success', 'data' => ['payments' => $query->latest('payment_date')->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_charge_id' => 'required|exists:service_charges,id',
            'amount'            => 'required|numeric|min:0',
            'payment_date'      => 'required|date',
            'payment_method'    => 'nullable|string|max:100',
            'remark'            => 'nullable|string',
        ]);

        $payment = ServiceChargePayment::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Service charge payment recorded.', 'data' => ['payment' => $payment]], 201);
    }

    public function destroy(ServiceChargePayment $serviceChargePayment): JsonResponse
    {
        $serviceChargePayment->delete();

        return response()->json(['status' => 'success', 'message' => 'Service charge payment deleted.']);
    }
}