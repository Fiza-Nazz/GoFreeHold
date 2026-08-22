<?php

namespace App\Domain\Contract\Models;

use App\Domain\Settlement\Models\Settlement;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LegalCase extends Model
{
    protected $fillable = [
        'contract_id',
        'settlement_id',
        'status',
        'notes',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function settlement(): BelongsTo
    {
        return $this->belongsTo(Settlement::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(LegalCaseDocument::class);
    }
}
