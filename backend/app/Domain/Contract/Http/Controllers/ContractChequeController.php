<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Models\ContractCheque;
use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class ContractChequeController extends Controller
{
    public function index(Request $request, ?Contract $contract = null): JsonResponse
    {
        $query = ContractCheque::with('contract:id,unit_id')->latest();

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->whereHas('contract', function ($q) use ($ownerId) {
                $q->where('contracts.owner_id', $ownerId)
                  ->orWhereHas('unit.property', fn ($p) => $p->where('owner_id', $ownerId));
            });
        }

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
        // The tracker uses the full form. Existing contract quick-add remains supported.
        $fullForm = !$contract || $request->hasAny(['account_holder_name', 'payee_name', 'nature', 'type']);
        $required = $fullForm ? 'required' : 'nullable';
        $validated = $request->validate([
            'contract_id'   => ($contract ? 'nullable' : 'required') . '|exists:contracts,id',
            'cheque_number' => 'nullable|string|max:100',
            'bank_name'     => 'required|string|max:255',
            'amount'        => 'required|numeric|min:0.01|max:99999999.99|decimal:0,2',
            'due_date'      => 'required|date',
            'notes'         => $required . '|string|max:5000',
            'account_holder_name' => $required . '|string|max:255',
            'payee_name' => $required . '|string|max:255',
            'nature' => $required . '|in:RENT,DEPOSIT,MAINTENANCE,OTHER',
            'type' => $required . '|string|max:100',
            'cheque_image' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $cId = $contract?->id ?? ($validated['contract_id'] ?? null);
            if ($cId) {
                $c = Contract::findOrFail($cId);
                $contractOwnerId = (int) ($c->owner_id ?: $c->unit?->property?->owner_id);
                abort_unless($contractOwnerId === (int) $ownerId, 403, 'Unauthorized access to this contract.');
            }
        }

        $validated['contract_id'] = $contract?->id ?? $validated['contract_id'];
        $validated['status'] = 'pending';
        unset($validated['cheque_image']);
        $path = null;
        try {
            if ($request->hasFile('cheque_image')) {
                $file = $request->file('cheque_image');
                $path = $file->store('cheque-attachments', 'local');
                if (!$path) {
                    throw new \RuntimeException('Unable to store cheque attachment.');
                }
                $validated['cheque_image_path'] = $path;
                $validated['cheque_image_name'] = 'cheque-attachment.' . $file->extension();
            }
            $cheque = ContractCheque::create($validated);
        } catch (\Throwable $exception) {
            if ($path) Storage::disk('local')->delete($path);
            throw $exception;
        }

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
        $user = request()->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $contractOwnerId = (int) ($contract->owner_id ?: $contract->unit?->property?->owner_id);
            abort_unless($contractOwnerId === (int) $ownerId, 403, 'Unauthorized access to this contract.');
        }

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
        $user = request()->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $contractOwnerId = (int) ($contract->owner_id ?: $contract->unit?->property?->owner_id);
            abort_unless($contractOwnerId === (int) $ownerId, 403, 'Unauthorized access to this contract.');
        }

        if ($cheque->contract_id !== $contract->id) {
            return response()->json(['status' => 'error', 'message' => 'Cheque does not belong to this contract.'], 404);
        }

        $path = $cheque->cheque_image_path;
        $cheque->delete();
        if ($path) Storage::disk('local')->delete($path);

        return response()->json(['status' => 'success', 'message' => 'Cheque removed.']);
    }

    public function attachment(Contract $contract, ContractCheque $cheque): Response
    {
        $user = request()->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $contractOwnerId = (int) ($contract->owner_id ?: $contract->unit?->property?->owner_id);
            abort_unless($contractOwnerId === (int) $ownerId, 403, 'Unauthorized access to this contract.');
        }

        abort_unless($cheque->contract_id === $contract->id, 404);
        abort_unless($cheque->cheque_image_path && Storage::disk('local')->exists($cheque->cheque_image_path), 404);
        return Storage::disk('local')->download($cheque->cheque_image_path, $cheque->cheque_image_name,
            ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store']);
    }
}
