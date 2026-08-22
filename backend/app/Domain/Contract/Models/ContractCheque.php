<?php

namespace App\Domain\Contract\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractCheque extends Model
{
    use HasFactory;

    // status: pending, cleared, bounced
    protected $fillable = [
        'contract_id', 'cheque_number', 'bank_name',
        'amount', 'due_date', 'status', 'notes',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}