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
        'account_holder_name', 'payee_name', 'nature', 'type', 'cheque_image_path', 'cheque_image_name',
    ];

    protected $hidden = ['cheque_image_path'];
    protected $appends = ['has_cheque_image'];

    public function getHasChequeImageAttribute(): bool
    {
        return !empty($this->cheque_image_path);
    }

    protected $casts = [
        'due_date' => 'date',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}
