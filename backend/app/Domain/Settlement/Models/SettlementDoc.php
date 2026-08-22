<?php

namespace App\Domain\Settlement\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SettlementDoc extends Model
{
    use HasFactory;

    protected $fillable = ['settlement_id', 'file_name', 'file_path'];

    public function settlement(): BelongsTo
    {
        return $this->belongsTo(Settlement::class);
    }
}