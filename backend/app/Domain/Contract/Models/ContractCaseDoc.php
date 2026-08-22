<?php

namespace App\Domain\Contract\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Legal case document files. Case tracking itself is the on_case flag
 * on contracts/settlements (per approved plan — no legal_cases table).
 */
class ContractCaseDoc extends Model
{
    use HasFactory;

    protected $fillable = ['contract_id', 'file_name', 'file_path'];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}