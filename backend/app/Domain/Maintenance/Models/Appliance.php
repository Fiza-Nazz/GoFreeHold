<?php

namespace App\Domain\Maintenance\Models;

use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appliance extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'name',
        'brand',
        'model',
        'serial_number',
        'purchase_date',
        'warranty_expiry',
        'condition',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date:Y-m-d',
        'warranty_expiry' => 'date:Y-m-d',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}
