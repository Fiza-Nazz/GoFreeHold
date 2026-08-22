<?php

namespace App\Domain\Settlement\Models;

use App\Domain\Auth\Models\Owner;
use App\Domain\Contract\Models\Contract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Owner-centric settlement with optional tenancy link (contract_id).
 * contract_id identifies which active lease/unit to vacate on completion.
 */
class Settlement extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'contract_id',
        'vacant_date',
        'dues',
        'receivable',
        'status',
        'on_case',
    ];

    protected $casts = [
        'vacant_date' => 'date',
        'on_case'     => 'boolean',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function docs(): HasMany
    {
        return $this->hasMany(SettlementDoc::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SettlementPayment::class);
    }
}
