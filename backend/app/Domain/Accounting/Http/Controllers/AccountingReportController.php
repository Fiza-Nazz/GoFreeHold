<?php

namespace App\Domain\Accounting\Http\Controllers;

use App\Domain\Accounting\Services\ReportService;
use App\Domain\Auth\Services\OwnerContextResolver;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountingReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
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

    public function trialBalance(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $asOf = $request->query('as_of');
        $ownerId = $request->filled('owner_id') ? (int) $request->owner_id : null;

        $report = $this->reportService->trialBalance($orgId, $asOf, $ownerId);

        return response()->json([
            'status' => 'success',
            'data'   => $report,
        ]);
    }

    public function incomeStatement(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $from = $request->query('from');
        $to = $request->query('to');
        $ownerId = $request->filled('owner_id') ? (int) $request->owner_id : null;

        $report = $this->reportService->incomeStatement($orgId, $from, $to, $ownerId);

        return response()->json([
            'status' => 'success',
            'data'   => $report,
        ]);
    }

    public function balanceSheet(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $asOf = $request->query('as_of');
        $ownerId = $request->filled('owner_id') ? (int) $request->owner_id : null;

        $report = $this->reportService->balanceSheet($orgId, $asOf, $ownerId);

        return response()->json([
            'status' => 'success',
            'data'   => $report,
        ]);
    }

    public function cashFlow(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $from = $request->query('from');
        $to = $request->query('to');
        $ownerId = $request->filled('owner_id') ? (int) $request->owner_id : null;

        $report = $this->reportService->cashFlow($orgId, $from, $to, $ownerId);

        return response()->json([
            'status' => 'success',
            'data'   => $report,
        ]);
    }

    public function cashRunning(Request $request): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $from = $request->query('from');
        $to = $request->query('to');
        $accountId = $request->filled('account_id') ? (int) $request->account_id : null;

        $report = $this->reportService->cashRunning($orgId, $from, $to, $accountId);

        return response()->json([
            'status' => 'success',
            'data'   => $report,
        ]);
    }

    public function accountLedger(Request $request, int $id): JsonResponse
    {
        $orgId = $this->resolveOrgId($request);
        $from = $request->query('from');
        $to = $request->query('to');

        $report = $this->reportService->accountLedger($orgId, $id, $from, $to);

        return response()->json([
            'status' => 'success',
            'data'   => $report,
        ]);
    }
}
