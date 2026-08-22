<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\Bank;
use App\Domain\Settlement\Models\BankAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    public function index(): JsonResponse
    {
        $accounts = BankAccount::with('bank:id,name')->get();

        return response()->json(['status' => 'success', 'data' => ['bank_accounts' => $accounts]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bank_id'        => 'nullable|exists:bank,id',
            'bank_name'      => 'nullable|string|max:255', // convenience: create bank on the fly
            'account_name'   => 'required|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'iban'           => 'nullable|string|max:100',
            'branch'         => 'nullable|string|max:255',
        ]);

        if (empty($validated['bank_id']) && !empty($validated['bank_name'])) {
            $validated['bank_id'] = Bank::firstOrCreate(['name' => $validated['bank_name']])->id;
        }
        unset($validated['bank_name']);

        $account = BankAccount::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Bank account created.', 'data' => ['bank_account' => $account->load('bank')]], 201);
    }

    public function show(BankAccount $bankAccount): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['bank_account' => $bankAccount->load('bank')]]);
    }

    public function update(Request $request, BankAccount $bankAccount): JsonResponse
    {
        $validated = $request->validate([
            'bank_id'        => 'nullable|exists:bank,id',
            'account_name'   => 'string|max:255',
            'account_number' => 'nullable|string|max:100',
            'iban'           => 'nullable|string|max:100',
            'branch'         => 'nullable|string|max:255',
        ]);

        $bankAccount->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Bank account updated.', 'data' => ['bank_account' => $bankAccount]]);
    }

    public function destroy(BankAccount $bankAccount): JsonResponse
    {
        $bankAccount->delete();

        return response()->json(['status' => 'success', 'message' => 'Bank account deleted.']);
    }

    public function banks(): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['banks' => Bank::all()]]);
    }
}