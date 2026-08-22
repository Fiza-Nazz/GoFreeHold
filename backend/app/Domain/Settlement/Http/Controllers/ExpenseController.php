<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\Expense;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Expense::with('category:id,name');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $expenses = $query->latest('date')->get();

        return response()->json([
            'status' => 'success',
            'data'   => ['expenses' => $expenses, 'total' => $expenses->sum('amount')],
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

        $expense = Expense::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Expense recorded.', 'data' => ['expense' => $expense]], 201);
    }

    public function show(Expense $expense): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['expense' => $expense->load('category')]]);
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'amount'      => 'numeric|min:0',
            'date'        => 'date',
            'description' => 'nullable|string',
        ]);

        $expense->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Expense updated.', 'data' => ['expense' => $expense]]);
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();

        return response()->json(['status' => 'success', 'message' => 'Expense deleted.']);
    }
}