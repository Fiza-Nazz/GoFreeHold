<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Models\ContractCheque;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContractChequeController extends Controller
{
    public function index(Request $request, ?Contract $contract = null): JsonResponse
    {
        $query = ContractCheque::with('contract:id,unit_id')->latest();

        $contractId = $contract?->id ?? $request->query('contract_id');
        if ($contractId) {
            $query->where('contract_id', $contractId);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(['status' => 'success', 'data' => ['cheques' => $query->get()]]);
    }

    public function store(Request $request, ?Contract $contract = null): JsonResponse
    {
        $validated = $request->validate([
            'contract_id'   => ($contract ? 'nullable' : 'required') . '|exists:contracts,id',
            'cheque_number' => 'required|string|max:100',
            'bank_name'     => 'required|string|max:255',
            'amount'        => 'required|numeric|min:1',
            'due_date'      => 'required|date',
            'notes'         => 'nullable|string',
        ]);

        $validated['contract_id'] = $contract?->id ?? $validated['contract_id'];
        $validated['status'] = 'pending';
        $cheque = ContractCheque::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Cheque added.', 'data' => ['cheque' => $cheque]], 201);
    }

    public function update(Request $request, Contract $contract, ContractCheque $cheque): JsonResponse
    {
        if ($cheque->contract_id !== $contract->id) {
            return response()->json(['status' => 'error', 'message' => 'Cheque does not belong to this contract.'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,cleared,bounced',
            'notes'  => 'nullable|string',
        ]);

        $cheque->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Cheque status updated.', 'data' => ['cheque' => $cheque]]);
    }

    public function generateReceipt(Contract $contract, ContractCheque $cheque): Response
    {
        if ($cheque->contract_id !== $contract->id) {
            return response()->json(['status' => 'error', 'message' => 'Cheque does not belong to this contract.'], 404);
        }

        $cheque->load('contract.tenant', 'contract.unit.property');

        $html = "<h1>Cheque Receipt</h1>
                 <p><strong>Cheque No:</strong> {$cheque->cheque_number}</p>
                 <p><strong>Bank:</strong> {$cheque->bank_name}</p>
                 <p><strong>Amount:</strong> AED {$cheque->amount}</p>
                 <p><strong>Due Date:</strong> {$cheque->due_date}</p>
                 <p><strong>Status:</strong> {$cheque->status}</p>
                 <hr>
                 <p>Generated on: " . now()->format('d M Y') . '</p>';

        $pdf = Pdf::loadHTML($html)->setPaper('a5', 'landscape');

        return $pdf->download('Cheque_Receipt_' . $cheque->id . '.pdf');
    }

    public function destroy(Contract $contract, ContractCheque $cheque): JsonResponse
    {
        if ($cheque->contract_id !== $contract->id) {
            return response()->json(['status' => 'error', 'message' => 'Cheque does not belong to this contract.'], 404);
        }

        $cheque->delete();

        return response()->json(['status' => 'success', 'message' => 'Cheque removed.']);
    }
}