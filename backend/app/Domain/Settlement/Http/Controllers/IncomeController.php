<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\Income;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Income::with('category:id,name');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $incomes = $query->latest('date')->get();

        return response()->json([
            'status' => 'success',
            'data'   => ['incomes' => $incomes, 'total' => $incomes->sum('amount')],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'amount'      => 'required|numeric|min:0',
            'date'        => 'required|date',
            'description' => 'nullable|string',
        ]);

        $income = Income::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Income recorded.', 'data' => ['income' => $income]], 201);
    }

    public function show(Income $income): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['income' => $income->load('category')]]);
    }

    public function update(Request $request, Income $income): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'amount'      => 'numeric|min:0',
            'date'        => 'date',
            'description' => 'nullable|string',
        ]);

        $income->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Income updated.', 'data' => ['income' => $income]]);
    }

    public function destroy(Income $income): JsonResponse
    {
        $income->delete();

        return response()->json(['status' => 'success', 'message' => 'Income deleted.']);
    }
}