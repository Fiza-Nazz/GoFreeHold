<?php

namespace App\Domain\Payment\Models;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceCharge extends Model
{
    use HasFactory;

    // charge_type: maintenance, utilities, cleaning, security, other
    // status: pending, paid, waived, partial
    protected $fillable = [
        'organization_id',
        'owner_id',
        'property_id',
        'unit_id',
        'contract_id',
        'charge_type',
        'period_label',
        'period_start',
        'period_end',
        'amount',
        'due_date',
        'paid_date',
        'status',
        'notes',
        'invoice_number',
        'vendor_name',
        'ac_transaction_id',
        'created_by',
    ];

    protected $casts = [
        'organization_id'   => 'integer',
        'owner_id'          => 'integer',
        'property_id'       => 'integer',
        'unit_id'           => 'integer',
        'contract_id'       => 'integer',
        'amount'            => 'decimal:2',
        'due_date'          => 'date',
        'paid_date'         => 'date',
        'period_start'      => 'date',
        'period_end'        => 'date',
        'ac_transaction_id' => 'integer',
        'created_by'        => 'integer',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(ServiceChargePayment::class);
    }

    public function docs(): HasMany
    {
        return $this->hasMany(ServiceChargeDoc::class);
    }

    /**
     * Recalculate status and paid_date based on payments sum.
     */
    public function refreshStatus(): void
    {
        if ($this->status === 'waived') {
            return;
        }

        $paid = (float) $this->payments()->sum('amount');

        if ($paid <= 0) {
            // If legacy mark-paid without payment rows, keep status
            if ($this->status === 'paid' && !$this->payments()->exists()) {
                return;
            }
            $this->update([
                'status'    => 'pending',
                'paid_date' => null,
            ]);
            return;
        }

        if ($paid >= (float) $this->amount) {
            $this->update([
                'status'    => 'paid',
                'paid_date' => $this->paid_date ?? now()->toDateString(),
            ]);
            return;
        }

        $this->update([
            'status'    => 'partial',
            'paid_date' => null,
        ]);
    }
}
