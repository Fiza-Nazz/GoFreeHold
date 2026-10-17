<?php

namespace App\Domain\Accounting\Models;

use App\Domain\Platform\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChartAccount extends Model
{
    use HasFactory;

    protected $table = 'ac_chart_accounts';

    protected $fillable = [
        'organization_id',
        'code',
        'name',
        'type',
        'account_header',
        'parent_coa',
        'description',
        'dr_cr',
        'is_cash',
        'status',
    ];

    protected $casts = [
        'is_cash'    => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function isLedger(): bool
    {
        return strtoupper((string) $this->description) === 'LEDGER';
    }

    public function isGroup(): bool
    {
        return strtoupper((string) $this->description) === 'GROUP';
    }

    public function parentGroupId(): ?int
    {
        return (is_numeric($this->parent_coa) && (int) $this->parent_coa > 0)
            ? (int) $this->parent_coa
            : null;
    }

    public function isCashLike(): bool
    {
        if ($this->is_cash) {
            return true;
        }

        $haystack = strtolower(($this->name ?? '') . ' ' . ($this->account_header ?? ''));
        return str_contains($haystack, 'cash') || str_contains($haystack, 'bank');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_coa', 'id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_coa', 'id');
    }

    public function ledgers(): HasMany
    {
        return $this->hasMany(Ledger::class, 'chartaccount_id');
    }
}
