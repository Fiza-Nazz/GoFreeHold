<?php

namespace App\Domain\Maintenance\Models;

use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryItem extends Model
{
    use HasFactory;

    // location_type: warehouse, unit
    // FLAG: location_id is legacy NOT NULL column — keep in sync with unit_id / 0 for warehouse
    protected $fillable = [
        'name',
        'category',
        'quantity',
        'unit_price',
        'unit_cost',
        'location_type',
        'location_id',
        'unit_id', // null if warehouse stock, set if unit-assigned stock
        'min_stock_alert',
        'notes',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}