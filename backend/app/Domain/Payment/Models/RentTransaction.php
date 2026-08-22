<?php

namespace App\Domain\Payment\Models;

use App\Domain\Contract\Models\Contract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Double-entry contract ledger (real schema table: rent_transactions).
 * debit  = amount owed (e.g. monthly rent due)
 * credit = amount received (any payment type: rent, DEWA, deposit, etc.)
 * Running balance for a contract = SUM(debit) - SUM(credit)
 */
class RentTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'contract_id',
        'payment_id',
        'date',
        'description',
        'debit',
        'credit',
        'deleted_by',
        'deletion_reason',
    ];

    protected $casts = [
        'date'       => 'date',
        'debit'      => 'decimal:2',
        'credit'     => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}