<?php

namespace App\Domain\Payment\Models;

use App\Domain\Contract\Models\Contract;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Service charges linked to tenancy / unit.
 *
 * FLAG — PENDING CLIENT CONFIRMATION (Step 10):
 * Real schema / plan never confirmed whether service_charges should FK to
 * contract_id only, unit_id only, or both. Current DB keeps BOTH columns
 * and both foreign keys. Do NOT drop either until the client confirms.
 */
class ServiceCharge extends Model
{
    use HasFactory;

    // charge_type: maintenance, utilities, cleaning, security, other
    protected $fillable = [
        'contract_id', // FLAG: keep until client confirms ownership FK
        'unit_id',     // FLAG: keep until client confirms ownership FK
        'charge_type',
        'amount',
        'due_date',
        'paid_date',
        'status',  // pending, paid, waived
        'notes',
    ];

    protected $casts = [
        'due_date'  => 'date',
        'paid_date' => 'date',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(ServiceChargePayment::class);
    }
}