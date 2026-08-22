<?php

namespace App\Domain\Settlement\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SettlementPayment extends Model
{
    use HasFactory;

    protected $fillable = ['settlement_id', 'payment_method', 'amount', 'payment_date'];

    protected $casts = [
        'payment_date' => 'date',
    ];

    public function settlement(): BelongsTo
    {
        return $this->belongsTo(Settlement::class);
    }
}