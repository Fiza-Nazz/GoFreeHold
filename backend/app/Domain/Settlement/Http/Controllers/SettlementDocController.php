<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\SettlementDoc;
use App\Domain\Settlement\Services\SettlementService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettlementDocController extends Controller
{
    public function __construct(private readonly SettlementService $settlementService)
    {
    }

    private function assertSettlementAccess(Request $request, int $settlementId): void
    {
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $resolver = app(\App\Domain\Auth\Services\OwnerContextResolver::class);
            $ownerId = $resolver->ownerId($user);
            $orgId = null;
            try {
                $orgId = $resolver->organizationId($user);
            } catch (\Throwable) {}

            $settlement = \App\Domain\Settlement\Models\Settlement::with('contract.unit.property')->find($settlementId);
            abort_unless($settlement, 404, 'Settlement not found.');

            $settlementOwnerId = (int) ($settlement->owner_id ?: $settlement->contract?->owner_id ?: $settlement->contract?->unit?->property?->owner_id);
            $matchesOwner = $settlementOwnerId === (int) $ownerId;
            $settlementOrgId = (int) ($settlement->organization_id ?? $settlement->contract?->organization_id ?? 0);
            $matchesOrg = $orgId && ($settlementOrgId === (int) $orgId);

            abort_unless($matchesOwner || $matchesOrg, 404, 'Settlement not found.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $query = SettlementDoc::query();

        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $resolver = app(\App\Domain\Auth\Services\OwnerContextResolver::class);
            $ownerId = $resolver->ownerId($user);
            $orgId = null;
            try {
                $orgId = $resolver->organizationId($user);
            } catch (\Throwable) {}

            $query->whereHas('settlement', function ($s) use ($ownerId, $orgId) {
                $s->where('owner_id', $ownerId)
                  ->orWhereHas('contract', function ($c) use ($ownerId, $orgId) {
                      $c->where('owner_id', $ownerId);
                      if ($orgId) {
                          $c->orWhere('organization_id', $orgId);
                      }
                  });
            });
        }

        if ($request->has('settlement_id')) {
            $this->assertSettlementAccess($request, (int) $request->settlement_id);
            $query->where('settlement_id', $request->settlement_id);
        }

        return response()->json(['status' => 'success', 'data' => ['docs' => $query->latest()->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settlement_id' => 'required|exists:settlements,id',
            'file'          => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
        ]);

        $this->assertSettlementAccess($request, (int) $validated['settlement_id']);

        $doc = $this->settlementService->storeDocument((int) $validated['settlement_id'], $request->file('file'));

        return response()->json(['status' => 'success', 'message' => 'Settlement document uploaded.', 'data' => ['doc' => $doc]], 201);
    }

    public function show(Request $request, SettlementDoc $settlementDoc): JsonResponse
    {
        $this->assertSettlementAccess($request, (int) $settlementDoc->settlement_id);

        return response()->json(['status' => 'success', 'data' => ['doc' => $settlementDoc]]);
    }

    public function download(Request $request, SettlementDoc $settlementDoc)
    {
        $this->assertSettlementAccess($request, (int) $settlementDoc->settlement_id);

        if (\Illuminate\Support\Facades\Storage::disk('local')->exists($settlementDoc->file_path)) {
            return \Illuminate\Support\Facades\Storage::disk('local')->download($settlementDoc->file_path, $settlementDoc->file_name);
        }

        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($settlementDoc->file_path)) {
            return \Illuminate\Support\Facades\Storage::disk('public')->download($settlementDoc->file_path, $settlementDoc->file_name);
        }

        abort(404, 'File not found on disk.');
    }

    public function destroy(Request $request, SettlementDoc $settlementDoc): JsonResponse
    {
        $this->assertSettlementAccess($request, (int) $settlementDoc->settlement_id);
        $this->settlementService->deleteDocument($settlementDoc);

        return response()->json(['status' => 'success', 'message' => 'Settlement document deleted.']);
    }
}
