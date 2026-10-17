<?php

namespace App\Domain\Accounting\Http\Controllers;

use App\Domain\Accounting\Models\AccountingTransaction;
use App\Domain\Accounting\Services\JournalService;
use App\Domain\Auth\Services\OwnerContextResolver;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JournalController extends Controller
{
    public function __construct(
        private readonly JournalService $journalService,
        private readonly OwnerContextResolver $resolver
    ) {
    }

    private function resolveOrgId(Request $request): int
    {
        $user = $request->user();
        abort_unless($user, 401);

        $orgId = null;
        try {
            $orgId = $this->resolver->organizationId($user);
        } catch (\Throwable) {}

        if (!$orgId) {
            $orgId = $user->organization_id;
        }

        if (!$orgId && $user->role === 'owner') {
            $orgId = DB::table('organizations')->where('primary_owner_id', $user->id)->value('id');
        }

        abort_unless($orgId, 403, 'No active organization found for this account.');

        return (int) $orgId;
    }

    public function index(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $query = AccountingTransaction::where('organization_id', $orgId)
            ->with(['ledgers.chartAccount:id,code,name,type', 'creator:id,name']);

        if ($request->filled('from')) {
            $query->where('date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->where('date', '<=', $request->to);
        }
        if ($request->filled('status')) {
            $query->where('status', strtoupper((string) $request->status));
        }
        if ($request->filled('source_type')) {
            $query->where('source_type', strtoupper((string) $request->source_type));
        }
        if ($request->filled('owner_id')) {
            $query->where('owner_id', (int) $request->owner_id);
        }
        if ($request->filled('q')) {
            $term = '%' . $request->q . '%';
            $query->where(function ($q) use ($term) {
                $q->where('description', 'like', $term)
                  ->orWhere('source_type', 'like', $term);
            });
        }

        $perPage = min(100, max(1, (int) $request->query('per_page', 25)));
        $journals = $query->latest('date')->latest('id')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'journals' => $journals->items(),
                'total'    => $journals->total(),
                'page'     => $journals->currentPage(),
                'last_page'=> $journals->lastPage(),
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $journal = AccountingTransaction::where('organization_id', $orgId)
            ->where('id', $id)
            ->with(['ledgers.chartAccount', 'creator:id,name'])
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'journal' => $journal,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $user = $request->user();

        $validated = $request->validate([
            'date'                  => 'required|date',
            'description'           => 'required|string|max:500',
            'owner_id'              => 'nullable|integer',
            'contract_id'           => 'nullable|integer',
            'property_id'           => 'nullable|integer',
            'unit_id'               => 'nullable|integer',
            'lines'                 => 'required|array|min:2',
            'lines.*.chartaccount_id' => 'required|integer',
            'lines.*.debit'         => 'required|numeric|min:0',
            'lines.*.credit'        => 'required|numeric|min:0',
        ]);

        $transaction = $this->journalService->post(
            organizationId: $orgId,
            date: $validated['date'],
            description: $validated['description'],
            lines: $validated['lines'],
            sourceType: 'MANUAL_JOURNAL',
            sourceId: null,
            ownerId: $validated['owner_id'] ?? null,
            contractId: $validated['contract_id'] ?? null,
            propertyId: $validated['property_id'] ?? null,
            unitId: $validated['unit_id'] ?? null,
            createdBy: $user?->id,
            status: 'COMPLETED'
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Journal entry posted successfully.',
            'data'    => [
                'journal' => $transaction,
            ],
        ], 201);
    }

    public function reverse(Request $request, int $id): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $user = $request->user();

        $journal = AccountingTransaction::where('organization_id', $orgId)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $reversal = $this->journalService->reverse(
            transaction: $journal,
            actorUserId: $user?->id,
            reason: $validated['reason'] ?? null
        );

        return response()->json([
            'status'  => 'success',
            'message' => "Journal #{$journal->id} reversed successfully by Journal #{$reversal->id}.",
            'data'    => [
                'reversal' => $reversal,
            ],
        ]);
    }
}
