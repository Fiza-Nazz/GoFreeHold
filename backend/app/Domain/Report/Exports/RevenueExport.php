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
        return Payment::whereYear('date', $this->year)->latest('date')->get();
    }

    public function headings(): array
    {
        return ['ID', 'Contract ID', 'Type', 'Mode', 'Amount (AED)', 'Date', 'Due Date', 'Ref No', 'Remarks'];
    }

    public function map($p): array
    {
        return [
            $p->id,
            $p->contract_id,
            $p->type,
            $p->mode,
            $p->amount,
            optional($p->date)->format('Y-m-d') ?? $p->date,
            optional($p->due_date)->format('Y-m-d') ?? $p->due_date,
            $p->reference_number,
            $p->remarks,
        ];
    }
}
