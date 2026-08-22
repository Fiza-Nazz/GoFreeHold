<?php

namespace App\Domain\Contract\Models;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Property\Models\Unit;
use App\Models\ContractPayable;
use App\Models\Payment;
use App\Models\RentTransaction;
use App\Models\ServiceCharge;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'tenant_id',
        'owner_id',
        'date',
        'rent_amount',
        'lease_term',
        'start_date',
        'end_date',
        'due_date',
        'security_deposit',
        'deposit_type',
        'dewa_deposit',
        'status',
        'last_renewed_at',
        'due',
        'on_case',
        'tenant_id_image',
        'owner_id_image',
        'type',
        'notes',
        'mode_of_payment',
        'contract_value',
        'passport_image',
        'visa_page',
        'tenant_id_back_image',
        'discount_type',
        'discount_info',
    ];

    protected $casts = [
        'date'             => 'date',
        'start_date'       => 'date',
        'end_date'         => 'date',
        'due_date'         => 'date',
        'last_renewed_at'  => 'datetime',
        'on_case'          => 'boolean',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class, 'owner_id');
    }

    public function cheques(): HasMany
    {
        return $this->hasMany(ContractCheque::class);
    }

    public function callLogs(): HasMany
    {
        return $this->hasMany(CallLog::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function rentTransactions(): HasMany
    {
        return $this->hasMany(RentTransaction::class);
    }

    public function serviceCharges(): HasMany
    {
        return $this->hasMany(ServiceCharge::class);
    }

    public function tenancyRes(): HasOne
    {
        return $this->hasOne(TenancyRes::class);
    }

    public function tenancyContracts(): HasMany
    {
        return $this->hasMany(TenancyContract::class);
    }

    public function terms(): HasMany
    {
        return $this->hasMany(Term::class, 'cid');
    }

    public function docs(): HasMany
    {
        return $this->hasMany(ContractDoc::class);
    }

    public function caseDocs(): HasMany
    {
        return $this->hasMany(ContractCaseDoc::class);
    }

    public function payables(): HasMany
    {
        return $this->hasMany(ContractPayable::class);
    }
}