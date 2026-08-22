<?php

namespace App\Domain\Contract\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * UAE residential tenancy form data for a contract.
 */
class TenancyRes extends Model
{
    use HasFactory;

    protected $table = 'tenancy_res';

    protected $fillable = [
        'contract_id',
        'owner_name', 'lessor_name', 'lessor_emirates_id', 'lessor_license_no', 'lessor_email', 'lessor_phone',
        'tenant_name', 'tenant_emirates_id', 'tenant_license_no', 'tenant_email', 'tenant_phone',
        'plot_no', 'property_name', 'property_usage', 'property_area', 'premises_no', 'property_type', 'location',
        'annual_rent', 'period_from', 'period_to', 'security_deposit', 'mode_of_payment',
    ];

    protected $casts = [
        'period_from' => 'date',
        'period_to'   => 'date',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }
}