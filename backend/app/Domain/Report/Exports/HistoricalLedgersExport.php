<?php
namespace App\Domain\Report\Exports;

use App\Domain\Payment\Models\RentTransaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class HistoricalLedgersExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private ?int $contractId = null)
    {
    }

    public function collection()
    {
        $query = RentTransaction::with(['contract.unit.property', 'contract.tenant:id,name'])
            ->withTrashed()
            ->latest('date');

        if ($this->contractId) {
            $query->where('contract_id', $this->contractId);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return ['ID', 'Contract', 'Tenant', 'Date', 'Description', 'Debit', 'Credit', 'Deleted At'];
    }

    public function map($l): array
    {
        return [
            $l->id,
            'GFH-' . str_pad((string) $l->contract_id, 5, '0', STR_PAD_LEFT),
            $l->contract?->tenant?->name,
            optional($l->date)->format('Y-m-d') ?? $l->date,
            $l->description,
            $l->debit,
            $l->credit,
            optional($l->deleted_at)?->format('Y-m-d H:i') ?? '',
        ];
    }
}
