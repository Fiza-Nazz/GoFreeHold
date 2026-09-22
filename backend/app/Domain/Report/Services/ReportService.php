<?php

namespace App\Domain\Report\Services;

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
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function revenueAnalysis(int $year, ?int $ownerId = null): array
    {
        $monthSql = DB::getDriverName() === 'sqlite'
            ? "CAST(strftime('%m', date) AS INTEGER)"
            : 'MONTH(date)';

        $paymentBase = Payment::whereYear('date', $year)
            ->when($ownerId, fn ($q) => $q->whereHas('contract', fn ($c) => $c->where('owner_id', $ownerId)));

        $breakdown = (clone $paymentBase)
            ->selectRaw("{$monthSql} as month, type, SUM(amount) as total")
            ->groupBy('month', 'type')
            ->get();

        $byType = (clone $paymentBase)
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $payments = (clone $paymentBase)->with([
            'contract.tenant:id,name,email,contact',
            'contract.owner:id,name,email',
            'contract.unit.property:id,name',
            'contract.unit:id,number,property_id',
        ])
            ->latest('date')
            ->get();

        return [
            'year' => $year,
            'total_revenue' => (float) (clone $paymentBase)->sum('amount'),
            'total_rent' => (float) ($byType['rent'] ?? 0),
            'total_dewa' => (float) ($byType['dewa'] ?? 0),
            'total_deposit' => (float) ($byType['deposit'] ?? 0),
            'total_service_charge' => (float) ($byType['service_charge'] ?? 0),
            'breakdown' => $breakdown,
            'payments' => $payments,
        ];
    }

    public function receivables(?int $ownerId = null): array
    {
        $entries = RentTransaction::query()
            ->when($ownerId, fn ($q) => $q->whereHas('contract', fn ($c) => $c->where('owner_id', $ownerId)))
            ->selectRaw('contract_id, SUM(debit) as total_debit, SUM(credit) as total_credit, (SUM(debit) - SUM(credit)) as balance')
            ->groupBy('contract_id')
            ->havingRaw('(SUM(debit) - SUM(credit)) > 0')
            ->get()
            ->load(['contract.unit.property', 'contract.tenant:id,name']);

        return [
            'total_outstanding' => $entries->sum('balance'),
            'entries' => $entries,
        ];
    }

    public function expiringContracts(int $days, ?int $ownerId = null): array
    {
        $contracts = Contract::with(['unit.property', 'tenant:id,name,email', 'owner:id,name'])
            ->where('status', 'active')
            ->where('end_date', '<=', Carbon::now()->addDays($days))
            ->when($ownerId, fn ($q) => $q->where('owner_id', $ownerId))
            ->orderBy('end_date')
            ->get();

        return [
            'days_threshold' => $days,
            'total_count' => $contracts->count(),
            'contracts' => $contracts,
        ];
    }

    public function inventorySummary(?int $ownerId = null): array
    {
        $warehouseStock = InventoryItem::where('location_type', 'warehouse')
            ->when($ownerId !== null, fn ($q) => $q->where('owner_id', $ownerId))
            ->get();
        $unitStock = InventoryItem::where('location_type', 'unit')
            ->with('unit.property')
            ->when($ownerId !== null, fn ($q) => $q->where(function ($sq) use ($ownerId) {
                $sq->where('owner_id', $ownerId)
                   ->orWhereHas('unit', fn ($u) => $u->where('owner_id', $ownerId)->orWhereHas('property', fn ($p) => $p->where('owner_id', $ownerId)));
            }))
            ->get();
        $lowStockItems = InventoryItem::where('location_type', 'warehouse')
            ->when($ownerId !== null, fn ($q) => $q->where('owner_id', $ownerId))
            ->whereNotNull('min_stock_alert')
            ->whereColumn('quantity', '<=', 'min_stock_alert')
            ->get();

        return [
            'total_warehouse_items' => $warehouseStock->count(),
            'total_unit_items' => $unitStock->count(),
            'low_stock_count' => $lowStockItems->count(),
            'low_stock_items' => $lowStockItems,
            'warehouse_stock' => $warehouseStock,
            'unit_stock' => $unitStock,
        ];
    }

    public function historicalLedgers(?int $contractId = null, ?int $ownerId = null): array
    {
        $query = RentTransaction::with(['contract.unit.property', 'contract.tenant:id,name'])->withTrashed();

        if ($contractId !== null) {
            $query->where('contract_id', $contractId);
        }

        if ($ownerId !== null) {
            $query->whereHas('contract', fn ($c) => $c->where('owner_id', $ownerId));
        }

        return ['ledgers' => $query->latest('date')->get()];
    }

    public function export(string $type, ?int $year, int $days, ?int $contractId): ?object
    {
        return match ($type) {
            'revenue' => new RevenueExport($year),
            'receivables' => new ReceivablesExport(),
            'expired-contracts' => new ExpiredContractsExport($days),
            'inventory-summary' => new InventorySummaryExport(),
            'vacant-properties' => new VacantPropertiesExport(),
            'historical-ledgers' => new HistoricalLedgersExport($contractId),
            default => null,
        };
    }
}
