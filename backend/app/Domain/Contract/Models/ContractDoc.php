<?php

namespace App\Domain\Contract\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractDoc extends Model
{
    use HasFactory;

    protected $fillable = ['contract_id', 'file_name', 'file_path'];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}