<?php

namespace App\Domain\Contract\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Contract addendum clauses c1..c8.
 */
class TenancyContract extends Model
{
    use HasFactory;

    protected $fillable = ['contract_id', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}