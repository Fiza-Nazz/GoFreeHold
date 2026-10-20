<?php

namespace App\Domain\Payment\Models;

use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceChargeDoc extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_charge_id',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'doc_type',
        'uploaded_by',
    ];

    protected $casts = [
        'file_size'   => 'integer',
        'uploaded_by' => 'integer',
    ];

    public function serviceCharge(): BelongsTo
    {
        return $this->belongsTo(ServiceCharge::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
