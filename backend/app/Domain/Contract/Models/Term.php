<?php

namespace App\Domain\Contract\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Terms & conditions; linked to contract via "cid" (real schema naming).
 */
class Term extends Model
{
    use HasFactory;

    protected $fillable = ['cid', 'terms'];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class, 'cid');
    }
}