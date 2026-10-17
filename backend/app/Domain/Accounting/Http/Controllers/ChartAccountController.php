<?php

namespace App\Domain\Accounting\Http\Controllers;

use App\Domain\Accounting\Models\ChartAccount;
use App\Domain\Accounting\Services\AccountSeeder;
use App\Domain\Auth\Services\OwnerContextResolver;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ChartAccountController extends Controller
{
    public function __construct(
        private readonly AccountSeeder $accountSeeder,
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

        $query = ChartAccount::where('organization_id', $orgId);

        if ($request->filled('type')) {
            $query->where('type', strtolower((string) $request->type));
        }
        if ($request->filled('description')) {
            $query->where('description', strtoupper((string) $request->description));
        }
        if ($request->filled('status')) {
            $query->where('status', strtoupper((string) $request->status));
        }
        if ($request->boolean('is_cash')) {
            $query->where('is_cash', true);
        }
        if ($request->filled('q')) {
            $term = '%' . $request->q . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                  ->orWhere('code', 'like', $term)
                  ->orWhere('account_header', 'like', $term);
            });
        }

        $accounts = $query->orderBy('code')->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'accounts' => $accounts,
            ],
        ]);
    }

    public function tree(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $accounts = ChartAccount::where('organization_id', $orgId)
            ->orderBy('code')
            ->get();

        // Build tree: section -> group -> ledger
        $sections = ['asset' => [], 'liability' => [], 'equity' => [], 'revenue' => [], 'expense' => [], 'cogs' => []];
        $groups = [];
        $ledgers = [];

        foreach ($accounts as $acc) {
            if ($acc->isGroup()) {
                $groups[$acc->id] = [
                    'id'             => $acc->id,
                    'code'           => $acc->code,
                    'name'           => $acc->name,
                    'type'           => $acc->type,
                    'description'    => 'GROUP',
                    'parent_coa'     => $acc->parent_coa,
                    'account_header' => $acc->account_header,
                    'children'       => [],
                ];
            } else {
                $ledgers[] = [
                    'id'             => $acc->id,
                    'code'           => $acc->code,
                    'name'           => $acc->name,
                    'type'           => $acc->type,
                    'description'    => 'LEDGER',
                    'parent_coa'     => $acc->parent_coa,
                    'account_header' => $acc->account_header,
                    'is_cash'        => $acc->is_cash,
                    'dr_cr'          => $acc->dr_cr,
                    'status'         => $acc->status,
                ];
            }
        }

        foreach ($ledgers as $ledger) {
            $parentId = is_numeric($ledger['parent_coa']) ? (int) $ledger['parent_coa'] : 0;
            if ($parentId > 0 && isset($groups[$parentId])) {
                $groups[$parentId]['children'][] = $ledger;
            } else {
                $type = $ledger['type'];
                if (isset($sections[$type])) {
                    $sections[$type][] = $ledger;
                }
            }
        }

        foreach ($groups as $group) {
            $type = $group['type'];
            if (isset($sections[$type])) {
                $sections[$type][] = $group;
            }
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'tree' => $sections,
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $account = ChartAccount::where('organization_id', $orgId)
            ->where('id', $id)
            ->with(['parent', 'children'])
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'account' => $account,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $validated = $request->validate([
            'code'           => [
                'required',
                'string',
                'max:50',
                Rule::unique('ac_chart_accounts')->where('organization_id', $orgId),
            ],
            'name'           => 'required|string|max:255',
            'type'           => 'required|string|in:asset,liability,equity,revenue,expense,cogs',
            'account_header' => 'nullable|string|max:100',
            'parent_coa'     => 'nullable|string|max:50',
            'description'    => 'required|string|in:GROUP,LEDGER',
            'dr_cr'          => 'nullable|string|in:DR,CR',
            'is_cash'        => 'boolean',
            'status'         => 'nullable|string|in:ACTIVE,INACTIVE',
        ]);

        $parentCoa = $validated['parent_coa'] ?? '0';

        // If parent_coa != '0', validate that parent exists in same org and is a GROUP
        if ($parentCoa !== '0' && is_numeric($parentCoa) && (int) $parentCoa > 0) {
            $parent = ChartAccount::where('organization_id', $orgId)->find((int) $parentCoa);
            if (!$parent) {
                throw ValidationException::withMessages([
                    'parent_coa' => ['The specified parent account does not exist in this organization.'],
                ]);
            }
            if (!$parent->isGroup()) {
                throw ValidationException::withMessages([
                    'parent_coa' => ['The parent account must be a GROUP folder, not a LEDGER.'],
                ]);
            }
        } else {
            $parentCoa = '0';
        }

        $account = ChartAccount::create([
            'organization_id' => $orgId,
            'code'            => trim($validated['code']),
            'name'            => trim($validated['name']),
            'type'            => strtolower(trim($validated['type'])),
            'account_header' => $validated['account_header'] ?? null,
            'parent_coa'     => $parentCoa,
            'description'    => strtoupper(trim($validated['description'])),
            'dr_cr'          => isset($validated['dr_cr']) ? strtoupper(trim($validated['dr_cr'])) : null,
            'is_cash'        => $validated['is_cash'] ?? false,
            'status'         => isset($validated['status']) ? strtoupper(trim($validated['status'])) : 'ACTIVE',
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Chart account created successfully.',
            'data'    => [
                'account' => $account,
            ],
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $account = ChartAccount::where('organization_id', $orgId)->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'code'           => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('ac_chart_accounts')->where('organization_id', $orgId)->ignore($account->id),
            ],
            'name'           => 'sometimes|string|max:255',
            'type'           => 'sometimes|string|in:asset,liability,equity,revenue,expense,cogs',
            'account_header' => 'nullable|string|max:100',
            'parent_coa'     => 'nullable|string|max:50',
            'description'    => 'sometimes|string|in:GROUP,LEDGER',
            'dr_cr'          => 'nullable|string|in:DR,CR',
            'is_cash'        => 'boolean',
            'status'         => 'sometimes|string|in:ACTIVE,INACTIVE',
        ]);

        if (isset($validated['description'])) {
            $newDesc = strtoupper(trim($validated['description']));
            // If changing from GROUP to LEDGER, verify no child accounts exist
            if ($account->isGroup() && $newDesc === 'LEDGER') {
                $hasChildren = ChartAccount::where('organization_id', $orgId)
                    ->where('parent_coa', (string) $account->id)
                    ->exists();
                if ($hasChildren) {
                    throw ValidationException::withMessages([
                        'description' => ['Cannot convert GROUP to LEDGER while child accounts exist.'],
                    ]);
                }
            }

            // If changing from LEDGER to GROUP, verify no posted ledger lines exist
            if ($account->isLedger() && $newDesc === 'GROUP') {
                $hasLines = DB::table('ac_ledgers')->where('chartaccount_id', $account->id)->exists();
                if ($hasLines) {
                    throw ValidationException::withMessages([
                        'description' => ['Cannot convert LEDGER to GROUP because transactions have already been posted to this account.'],
                    ]);
                }
            }
        }

        if (isset($validated['parent_coa']) && $validated['parent_coa'] !== '0') {
            $parentId = (int) $validated['parent_coa'];
            if ($parentId === $account->id) {
                throw ValidationException::withMessages([
                    'parent_coa' => ['An account cannot be its own parent.'],
                ]);
            }
            $parent = ChartAccount::where('organization_id', $orgId)->find($parentId);
            if (!$parent || !$parent->isGroup()) {
                throw ValidationException::withMessages([
                    'parent_coa' => ['Parent account must be an existing GROUP in this organization.'],
                ]);
            }
        }

        $account->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Chart account updated successfully.',
            'data'    => [
                'account' => $account->fresh(),
            ],
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $account = ChartAccount::where('organization_id', $orgId)->where('id', $id)->firstOrFail();

        // 1. Check if child accounts exist
        $hasChildren = ChartAccount::where('organization_id', $orgId)
            ->where('parent_coa', (string) $account->id)
            ->exists();

        if ($hasChildren) {
            throw ValidationException::withMessages([
                'account' => ['Cannot delete account because child accounts exist. Delete or reassign children first.'],
            ]);
        }

        // 2. Check if posted ledger lines exist
        $hasLines = DB::table('ac_ledgers')->where('chartaccount_id', $account->id)->exists();
        if ($hasLines) {
            throw ValidationException::withMessages([
                'account' => ['Cannot delete account because general ledger transactions have been posted to it.'],
            ]);
        }

        $account->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Chart account deleted successfully.',
        ]);
    }

    public function seedDefault(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);

        $accounts = $this->accountSeeder->seedForOrganization($orgId);

        return response()->json([
            'status'  => 'success',
            'message' => 'Default chart of accounts seeded successfully.',
            'data'    => [
                'count'    => count($accounts),
                'accounts' => $accounts,
            ],
        ]);
    }
}
