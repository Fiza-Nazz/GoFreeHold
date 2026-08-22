<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\FinancialEntry;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialTrackingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FinancialEntry::with(['contract:id', 'unit:id,number,property_id', 'recordedBy:id,name']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $entries = $query->latest('entry_date')->get();

        $totalIncome = FinancialEntry::where('type', 'income')->sum('amount');
        $totalExpense = FinancialEntry::where('type', 'expense')->sum('amount');
        $totalLoan = FinancialEntry::where('type', 'loan')->sum('amount');

        return response()->json([
            'status' => 'success',
            'data'   => [
                'entries' => $entries,
                'summary' => [
                    'total_income'  => $totalIncome,
                    'total_expense' => $totalExpense,
                    'total_loan'    => $totalLoan,
                    'net_cash_flow' => $totalIncome - $totalExpense,
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type'        => 'required|in:income,expense,loan',
            'category'    => 'required|string|max:100',
            'amount'      => 'required|numeric|min:1',
            'entry_date'  => 'required|date',
            'description' => 'nullable|string',
            'contract_id' => 'nullable|exists:contracts,id',
            'unit_id'     => 'nullable|exists:units,id',
        ]);

        $validated['recorded_by'] = $request->user()->id;
        $entry = FinancialEntry::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Financial entry recorded.',
            'data'    => ['entry' => $entry],
        ], 201);
    }

    public function destroy(FinancialEntry $financialEntry): JsonResponse
    {
        $financialEntry->delete();

        return response()->json(['status' => 'success', 'message' => 'Financial entry deleted.']);
    }
}