<?php
namespace App\Domain\Report\Exports;

use App\Domain\Payment\Models\Payment;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class RevenueExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private ?int $year = null)
    {
        $this->year = $year ?? (int) Carbon::now()->year;
    }

    public function collection()
    {
        return Payment::with([
            'contract.tenant:id,name,email',
            'contract.owner:id,name',
            'contract.unit.property:id,name',
            'contract.unit:id,number',
        ])->whereYear('date', $this->year)->latest('date')->get();
    }

    public function headings(): array
    {
        return ['Payment ID', 'Contract ID', 'Category / Type', 'Tenant Name', 'Owner Name', 'Property', 'Unit', 'Amount (AED)', 'Date', 'Payment Mode', 'Ref No', 'Remarks'];
    }

    public function map($p): array
    {
        return [
            $p->id,
            $p->contract_id ? 'GFH-' . str_pad($p->contract_id, 4, '0', STR_PAD_LEFT) : 'N/A',
            strtoupper($p->type ?? 'N/A'),
            $p->contract?->tenant?->name ?? 'N/A',
            $p->contract?->owner?->name ?? 'N/A',
            $p->contract?->unit?->property?->name ?? 'N/A',
            $p->contract?->unit?->number ?? 'N/A',
            $p->amount,
            optional($p->date)->format('Y-m-d') ?? $p->date,
            strtoupper($p->mode ?? 'N/A'),
            $p->reference_number ?? '',
            $p->remarks ?? '',
        ];
    }
}
