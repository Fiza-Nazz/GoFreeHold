<?php

namespace App\Domain\Contract\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LegalCaseDocument extends Model
{
    protected $fillable = [
        'legal_case_id',
        'file_name',
        'file_path',
    ];

    public function legalCase(): BelongsTo
    {
        return $this->belongsTo(LegalCase::class);
    }
}
