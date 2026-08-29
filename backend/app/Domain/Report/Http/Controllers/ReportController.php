<?php

namespace App\Domain\Report\Http\Controllers;

use App\Domain\Contract\Models\Contract;
use App\Domain\Maintenance\Models\InventoryItem;
use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\RentTransaction;
use App\Domain\Report\Exports\ExpiredContractsExport;
use App\Domain\Report\Exports\HistoricalLedgersExport;
use App\Domain\Report\Exports\InventorySummaryExport;
use App\Domain\Report\Exports\ReceivablesExport;
use App\Domain\Report\Exports\RevenueExport;
use App\Domain\Report\Exports\VacantPropertiesExport;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function revenueAnalysis(Request $request): JsonResponse
    {
        $year = $request->query('year', Carbon::now()->year);

        $monthSql = \Illuminate\Support\Facades\DB::getDriverName() === 'sqlite' ? "CAST(strftime('%m', date) AS INTEGER)" : 'MONTH(date)';

        $payments = Payment::whereYear('date', $year)
            ->selectRaw("{$monthSql} as month, type, SUM(amount) as total")
            ->groupBy('month', 'type')
            ->get();

        $totalRevenue = Payment::whereYear('date', $year)->sum('amount');

        return response()->json([
            'status' => 'success',
            'data'   => [
                'year'          => (int) $year,
                'total_revenue' => $totalRevenue,
                'breakdown'     => $payments,
            ],
        ]);
    }

    public function receivablesReport(): JsonResponse
    {
        $ledgers = RentTransaction::with(['contract.unit.property', 'contract.tenant:id,name'])
            ->selectRaw('contract_id, SUM(debit) as total_debit, SUM(credit) as total_credit, (SUM(debit) - SUM(credit)) as balance')
            ->groupBy('contract_id')
            ->havingRaw('(SUM(debit) - SUM(credit)) > 0')
            ->get()
            ->load(['contract.unit.property', 'contract.tenant:id,name']);

        $totalOutstanding = $ledgers->sum('balance');

        return response()->json([
            'status' => 'success',
            'data'   => [
                'total_outstanding' => $totalOutstanding,
                'entries'           => $ledgers,
            ],
        ]);
    }

    public function expiredContractsReport(Request $request): JsonResponse
    {
        $days = (int) $request->query('days', 100);
        $thresholdDate = Carbon::now()->addDays($days);

        $contracts = Contract::with(['unit.property', 'tenant:id,name,email', 'owner:id,name'])
            ->where('status', 'active')
            ->where('end_date', '<=', $thresholdDate)
            ->orderBy('end_date')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'days_threshold' => $days,
                'total_count'    => $contracts->count(),
                'contracts'      => $contracts,
            ],
        ]);
    }

    public function inventorySummary(): JsonResponse
    {
        $warehouseStock = InventoryItem::where('location_type', 'warehouse')->get();
        $unitStock = InventoryItem::where('location_type', 'unit')->with('unit.property')->get();

        $lowStockItems = InventoryItem::where('location_type', 'warehouse')
            ->whereNotNull('min_stock_alert')
            ->whereColumn('quantity', '<=', 'min_stock_alert')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'total_warehouse_items' => $warehouseStock->count(),
                'total_unit_items'      => $unitStock->count(),
                'low_stock_count'       => $lowStockItems->count(),
                'low_stock_items'       => $lowStockItems,
                'warehouse_stock'       => $warehouseStock,
                'unit_stock'            => $unitStock,
            ],
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
        $query = RentTransaction::with(['contract.unit.property', 'contract.tenant:id,name'])->withTrashed();

        if ($request->has('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }

        $ledgers = $query->latest('date')->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'ledgers' => $ledgers,
            ],
        ]);
    }

    /**
     * Excel (.xlsx) export via Maatwebsite — plan: real Excel, not CSV.
     */
    public function exportExcel(Request $request, string $type): BinaryFileResponse
    {
        $filename = 'GFH_Report_' . $type . '_' . date('Y-m-d') . '.xlsx';

        $export = match ($type) {
            'revenue' => new RevenueExport(
                $request->filled('year') ? (int) $request->query('year') : null
            ),
            'receivables' => new ReceivablesExport(),
            'expired-contracts' => new ExpiredContractsExport(
                (int) $request->query('days', 100)
            ),
            'inventory-summary' => new InventorySummaryExport(),
            'vacant-properties' => new VacantPropertiesExport(),
            'historical-ledgers' => new HistoricalLedgersExport(
                $request->filled('contract_id') ? (int) $request->query('contract_id') : null
            ),
            default => null,
        };

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