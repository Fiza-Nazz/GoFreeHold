<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\Term;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TermController extends Controller
{
    private function assertContractAccess(Request $request, int $contractId): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $contract = \App\Domain\Contract\Models\Contract::with('unit.property')->find($contractId);
            abort_unless($contract, 404, 'Contract not found.');
            $contractOwnerId = (int) ($contract->owner_id ?: $contract->unit?->property?->owner_id);
            abort_unless($contractOwnerId === (int) $ownerId, 403, 'Unauthorized access to this contract.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = Term::query();

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
            $query->whereHas('contract', function ($c) use ($ownerId) {
                $c->where('contracts.owner_id', $ownerId)
                  ->orWhereHas('unit.property', fn ($p) => $p->where('owner_id', $ownerId));
            });
        }

        if ($request->has('contract_id')) {
            $query->where('cid', $request->contract_id);
        }

        return response()->json(['status' => 'success', 'data' => ['terms' => $query->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cid'   => 'required|exists:contracts,id',
            'terms' => 'required|string',
        ]);

        $this->assertContractAccess($request, (int) $validated['cid']);
        $term = Term::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Terms saved.', 'data' => ['term' => $term]], 201);
    }

    public function show(Request $request, Term $term): JsonResponse
    {
        $this->assertContractAccess($request, (int) $term->cid);
        return response()->json(['status' => 'success', 'data' => ['term' => $term]]);
    }

    public function update(Request $request, Term $term): JsonResponse
    {
        $this->assertContractAccess($request, (int) $term->cid);
        $validated = $request->validate([
            'terms' => 'required|string',
        ]);

        $term->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Terms updated.', 'data' => ['term' => $term]]);
    }

    public function destroy(Request $request, Term $term): JsonResponse
    {
        $this->assertContractAccess($request, (int) $term->cid);
        $term->delete();

        return response()->json(['status' => 'success', 'message' => 'Terms deleted.']);
    }
}