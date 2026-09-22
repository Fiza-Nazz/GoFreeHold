<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\SettlementPayment;
use App\Domain\Settlement\Services\SettlementService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettlementPaymentController extends Controller
{
    public function __construct(private readonly SettlementService $settlementService)
    {
    }

    private function assertSettlementAccess(Request $request, int $settlementId): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $settlement = \App\Domain\Settlement\Models\Settlement::with('contract.unit.property')->find($settlementId);
            abort_unless($settlement, 404, 'Settlement not found.');
            $settlementOwnerId = (int) ($settlement->owner_id ?: $settlement->contract?->owner_id ?: $settlement->contract?->unit?->property?->owner_id);
            abort_unless($settlementOwnerId === (int) $ownerId, 403, 'Unauthorized access to this settlement.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = SettlementPayment::with('settlement:id,owner_id,status');

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->whereHas('settlement', function ($s) use ($ownerId) {
                $s->where('settlements.owner_id', $ownerId)
                  ->orWhereHas('contract', fn ($c) => $c->where('owner_id', $ownerId)->orWhereHas('unit.property', fn ($p) => $p->where('owner_id', $ownerId)));
            });
        }

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

        $this->assertSettlementAccess($request, (int) $validated['settlement_id']);
        $payment = $this->settlementService->recordPayment($validated);

        return response()->json(['status' => 'success', 'message' => 'Settlement payment recorded.', 'data' => ['payment' => $payment]], 201);
    }

    public function destroy(Request $request, SettlementPayment $settlementPayment): JsonResponse
    {
        $this->assertSettlementAccess($request, (int) $settlementPayment->settlement_id);
        $settlementPayment->delete();

        return response()->json(['status' => 'success', 'message' => 'Settlement payment deleted.']);
    }
}
