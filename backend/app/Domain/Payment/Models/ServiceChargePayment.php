<?php

namespace App\Domain\Payment\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceChargePayment extends Model
{
    use HasFactory;

    protected $fillable = ['service_charge_id', 'amount', 'payment_date', 'payment_method', 'remark'];

    protected $casts = [
        'payment_date' => 'date',
    ];

    public function serviceCharge(): BelongsTo
    {
        return $this->belongsTo(ServiceCharge::class);
    }
}