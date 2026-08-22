<?php
namespace App\Domain\Report\Exports;

use App\Domain\Contract\Models\Contract;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ExpiredContractsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private int $days = 100)
    {
    }

    public function collection()
    {
        return Contract::with(['unit.property', 'tenant:id,name,email', 'owner:id,name'])
            ->where('status', 'active')
            ->where('end_date', '<=', Carbon::now()->addDays($this->days))
            ->orderBy('end_date')
            ->get();
    }

    public function headings(): array
    {
        return ['Contract Ref', 'Tenant', 'Owner', 'Property', 'Unit', 'Start Date', 'End Date', 'Rent (AED)', 'Status'];
    }

    public function map($c): array
    {
        return [
            'GFH-' . str_pad((string) $c->id, 5, '0', STR_PAD_LEFT),
            $c->tenant?->name,
            $c->owner?->name,
            $c->unit?->property?->name,
            $c->unit?->number,
            optional($c->start_date)->format('Y-m-d') ?? $c->start_date,
            optional($c->end_date)->format('Y-m-d') ?? $c->end_date,
            $c->rent_amount,
            $c->status,
        ];
    }
}
