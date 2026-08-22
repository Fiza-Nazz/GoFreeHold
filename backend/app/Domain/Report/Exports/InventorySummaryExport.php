<?php
namespace App\Domain\Report\Exports;

use App\Domain\Maintenance\Models\InventoryItem;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class InventorySummaryExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function collection()
    {
        return InventoryItem::with('unit.property')->orderBy('location_type')->orderBy('name')->get();
    }

    public function headings(): array
    {
        return ['ID', 'Name', 'Location Type', 'Property', 'Unit', 'Quantity', 'Min Stock Alert', 'Low Stock?'];
    }

    public function map($item): array
    {
        $low = $item->min_stock_alert !== null && $item->quantity <= $item->min_stock_alert;

        return [
            $item->id,
            $item->name,
            $item->location_type,
            $item->unit?->property?->name,
            $item->unit?->number,
            $item->quantity,
            $item->min_stock_alert,
            $low ? 'YES' : 'NO',
        ];
    }
}
