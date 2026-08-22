<?php
namespace App\Domain\Report\Exports;

use App\Domain\Payment\Models\RentTransaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ReceivablesExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function collection()
    {
        return RentTransaction::query()
            ->selectRaw('contract_id, SUM(debit) as total_debit, SUM(credit) as total_credit, (SUM(debit) - SUM(credit)) as balance')
            ->groupBy('contract_id')
            ->havingRaw('(SUM(debit) - SUM(credit)) > 0')
            ->get()
            ->load(['contract.unit.property', 'contract.tenant:id,name']);
    }

    public function headings(): array
    {
        return ['Contract', 'Tenant', 'Property', 'Unit', 'Total Debit', 'Total Credit', 'Outstanding (AED)'];
    }

    public function map($row): array
    {
        return [
            'GFH-' . str_pad((string) $row->contract_id, 5, '0', STR_PAD_LEFT),
            $row->contract?->tenant?->name,
            $row->contract?->unit?->property?->name,
            $row->contract?->unit?->number,
            $row->total_debit,
            $row->total_credit,
            $row->balance,
        ];
    }
}
