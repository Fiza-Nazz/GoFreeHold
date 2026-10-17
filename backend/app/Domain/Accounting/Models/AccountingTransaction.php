<?php

namespace App\Domain\Accounting\Models;

use App\Domain\Auth\Models\User;
use App\Domain\Platform\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AccountingTransaction extends Model
{
    use HasFactory;

    protected $table = 'ac_transactions';

    protected $fillable = [
        'organization_id',
        'date',
        'description',
        'status',
        'source_type',
        'source_id',
        'owner_id',
        'contract_id',
        'property_id',
        'unit_id',
        'created_by',
    ];

    protected $casts = [
        'date'       => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function isCompleted(): bool
    {
        return strtoupper((string) $this->status) === 'COMPLETED';
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function ledgers(): HasMany
    {
        return $this->hasMany(Ledger::class, 'trans_id');
    }
}
