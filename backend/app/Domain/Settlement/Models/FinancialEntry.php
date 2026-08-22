<?php

namespace App\Domain\Settlement\Models;

use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialEntry extends Model
{
    use HasFactory;

    // type: income, expense, loan
    protected $fillable = [
        'type',
        'category',
        'amount',
        'entry_date',
        'description',
        'contract_id',
        'unit_id',
        'recorded_by',
    ];

    protected $casts = [
        'entry_date' => 'date',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}