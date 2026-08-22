<?php

namespace App\Domain\Maintenance\Models;

use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appliance extends Model
{
    use HasFactory;

    /**
     * Real DB columns: unit_id, name, brand, model, serial_number, purchase_date.
     * FLAG: warranty_expiry / condition / notes were draft extras — not in DB yet.
     */
    protected $fillable = [
        'unit_id',
        'name',
        'brand',
        'model',
        'serial_number',
        'purchase_date',
    ];

    protected $casts = [
        'purchase_date' => 'date',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}