<?php

namespace App\Domain\Payment\Models;

use App\Domain\Contract\Models\Contract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractPayable extends Model
{
    use HasFactory;

    protected $fillable = ['contract_id', 'description', 'amount', 'due_date', 'status'];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}