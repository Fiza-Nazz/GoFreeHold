<?php

namespace App\Domain\Contract\Models;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreparedContract extends Model
{
    use HasFactory;

    protected $table = 'prepared_contracts';

    protected $fillable = [
        'unit_id',
        'tenant_id',
        'owner_id',
        'start_date',
        'end_date',
        'rent_amount',
        'contract_value',
        'security_deposit',
        'lease_term',
        'payment_frequency',
        'mode_of_payment',
        'number_of_cheques',
        'notes',
        'status',
        'addendum_terms',
        'pdc_cheques',
        'new_tenant_details',
        'tenant_documents',
        'passport_image',
        'visa_page',
        'tenant_id_image',
        'tenant_id_back_image',
    ];

    protected $casts = [
        'unit_id'            => 'integer',
        'tenant_id'          => 'integer',
        'owner_id'           => 'integer',
        'start_date'         => 'date:Y-m-d',
        'end_date'           => 'date:Y-m-d',
        'rent_amount'        => 'float',
        'contract_value'     => 'float',
        'security_deposit'   => 'float',
        'number_of_cheques'  => 'integer',
        'addendum_terms'     => 'array',
        'pdc_cheques'        => 'array',
        'new_tenant_details' => 'array',
        'tenant_documents'   => 'array',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class, 'owner_id');
    }
}
