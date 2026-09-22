<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\Bank;
use App\Domain\Settlement\Models\BankAccount;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankAccountController extends Controller
{
    private function assertAccountAccess(Request $request, BankAccount $bankAccount): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            abort_unless((int) $bankAccount->owner_id === (int) $ownerId, 403, 'Unauthorized access to this bank account.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = BankAccount::with('bank:id,name');

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->where('owner_id', $ownerId);
        }

        $accounts = $query->get();

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

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $validated['owner_id'] = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
        }

        if (empty($validated['bank_id']) && !empty($validated['bank_name'])) {
            $validated['bank_id'] = Bank::firstOrCreate(['name' => $validated['bank_name']])->id;
        }
        unset($validated['bank_name']);

        $account = BankAccount::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Bank account created.', 'data' => ['bank_account' => $account->load('bank')]], 201);
    }

    public function show(Request $request, BankAccount $bankAccount): JsonResponse
    {
        $this->assertAccountAccess($request, $bankAccount);
        return response()->json(['status' => 'success', 'data' => ['bank_account' => $bankAccount->load('bank')]]);
    }

    public function update(Request $request, BankAccount $bankAccount): JsonResponse
    {
        $this->assertAccountAccess($request, $bankAccount);
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

    public function destroy(Request $request, BankAccount $bankAccount): JsonResponse
    {
        $this->assertAccountAccess($request, $bankAccount);
        $bankAccount->delete();

        return response()->json(['status' => 'success', 'message' => 'Bank account deleted.']);
    }

    public function banks(): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['banks' => Bank::all()]]);
    }
}