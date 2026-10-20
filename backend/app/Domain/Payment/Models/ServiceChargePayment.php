<?php

namespace App\Domain\Payment\Models;

use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceChargePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_charge_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'remark',
        'remarks',
        'recorded_by',
        'payment_id',
        'ac_transaction_id',
    ];

    protected $casts = [
        'amount'            => 'decimal:2',
        'payment_date'      => 'date',
        'service_charge_id' => 'integer',
        'recorded_by'       => 'integer',
        'payment_id'        => 'integer',
        'ac_transaction_id' => 'integer',
    ];

    public function serviceCharge(): BelongsTo
    {
        return $this->belongsTo(ServiceCharge::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
