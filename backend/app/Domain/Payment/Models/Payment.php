<?php

namespace App\Domain\Payment\Models;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * type: rent, dewa, deposit, settlement, service_charge, other
     * mode: cash, card, bank_transfer, cheque, online
     */
    protected $fillable = [
        'contract_id',
        'tenant_id',
        'type',
        'mode',
        'amount',
        'date',
        'due_date',
        'receipt_number',
        'reference_number',
        'remarks',
        'recorded_by',
        'deleted_by',
        'deletion_reason',
    ];

    protected $casts = [
        'date'       => 'date',
        'due_date'   => 'date',
        'deleted_at' => 'datetime',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(RentTransaction::class, 'payment_id');
    }
}