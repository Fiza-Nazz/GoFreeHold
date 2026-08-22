<?php

namespace App\Domain\Property\Models;

use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingCashReceipt extends Model
{
    protected $fillable = [
        'unit_id',
        'receipt_number',
        'tenant_name',
        'amount',
        'receipt_date',
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'receipt_date' => 'date',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
