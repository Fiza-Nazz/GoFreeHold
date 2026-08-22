<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\SettlementPayment;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettlementPaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SettlementPayment::with('settlement:id,owner_id,status');

        if ($request->has('settlement_id')) {
            $query->where('settlement_id', $request->settlement_id);
        }

        return response()->json(['status' => 'success', 'data' => ['payments' => $query->latest('payment_date')->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settlement_id'  => 'required|exists:settlements,id',
            'payment_method' => 'nullable|string|max:100',
            'amount'         => 'required|numeric|min:0',
            'payment_date'   => 'required|date',
        ]);

        $payment = SettlementPayment::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Settlement payment recorded.', 'data' => ['payment' => $payment]], 201);
    }

    public function destroy(SettlementPayment $settlementPayment): JsonResponse
    {
        $settlementPayment->delete();

        return response()->json(['status' => 'success', 'message' => 'Settlement payment deleted.']);
    }
}