<?php

namespace App\Domain\Payment\Models;

use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'ledger_id',
        'payment_id',
        'action',        // deleted, modified
        'reason',
        'performed_by',
        'snapshot',      // JSON snapshot of the original record before change
    ];

    protected $casts = [
        'snapshot' => 'array',
    ];

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}