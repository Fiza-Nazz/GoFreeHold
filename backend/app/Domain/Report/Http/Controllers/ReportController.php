<?php

namespace App\Domain\Report\Http\Controllers;

use App\Domain\Report\Services\ReportService;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reports)
    {
    }

    public function revenueAnalysis(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        return response()->json([
            'status' => 'success',
            'data' => $this->reports->revenueAnalysis((int) $request->query('year', Carbon::now()->year), $ownerId),
        ]);
    }

    public function receivablesReport(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        return response()->json([
            'status' => 'success',
            'data' => $this->reports->receivables($ownerId),
        ]);
    }

    public function expiredContractsReport(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        return response()->json([
            'status' => 'success',
            'data' => $this->reports->expiringContracts((int) $request->query('days', 100), $ownerId),
        ]);
    }

    public function inventorySummary(Request $request): JsonResponse
    {
        $ownerId = null;
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->reports->inventorySummary($ownerId),
        ]);
    }

    /**
     * @deprecated Module 3 — use Domain\Property\Http\Controllers\VacantPropertyController
     */
    public function vacantProperties()
    {
        return app(\App\Domain\Property\Http\Controllers\VacantPropertyController::class)();
    }

    public function historicalLedgers(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        return response()->json([
            'status' => 'success',
            'data' => $this->reports->historicalLedgers(
                $request->filled('contract_id') ? (int) $request->query('contract_id') : null,
                $ownerId
            ),
        ]);
    }

    /**
     * Excel (.xlsx) export via Maatwebsite — plan: real Excel, not CSV.
     */
    public function exportExcel(Request $request, string $type): BinaryFileResponse
    {
        $filename = 'GFH_Report_' . $type . '_' . date('Y-m-d') . '.xlsx';

        $export = $this->reports->export(
            $type,
            $request->filled('year') ? (int) $request->query('year') : null,
            (int) $request->query('days', 100),
            $request->filled('contract_id') ? (int) $request->query('contract_id') : null,
        );

        if (!$export) {
            abort(404, "Unknown report type: {$type}");
        }

        return Excel::download($export, $filename);
    }

    /**
     * @deprecated Use exportExcel — kept as alias so old clients still work.
     */
    public function exportCsv(Request $request, string $type): BinaryFileResponse
    {
        return $this->exportExcel($request, $type);
    }
}
