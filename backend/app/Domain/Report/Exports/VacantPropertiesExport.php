<?php
namespace App\Domain\Report\Exports;

use App\Domain\Property\Models\Unit;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class VacantPropertiesExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function collection()
    {
        return Unit::with('property:id,name', 'owner:id,name')
            ->where('status', 'AVAILABLE')
            ->orderBy('property_id')
            ->orderBy('number')
            ->get();
    }

    public function headings(): array
    {
        return ['Unit ID', 'Property', 'Unit Number', 'Owner', 'Category', 'Type', 'Size', 'Price (AED)', 'Status'];
    }

    public function map($u): array
    {
        return [
            $u->id,
            $u->property?->name,
            $u->number,
            $u->owner?->name,
            $u->category,
            $u->type,
            $u->size,
            $u->price,
            $u->status,
        ];
    }
}
