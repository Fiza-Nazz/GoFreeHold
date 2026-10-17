<?php

namespace App\Domain\Accounting\Models;

use App\Domain\Platform\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ledger extends Model
{
    use HasFactory;

    protected $table = 'ac_ledgers';

    public $timestamps = false;

    protected $fillable = [
        'organization_id',
        'trans_id',
        'chartaccount_id',
        'debit',
        'credit',
        'created_at',
    ];

    protected $casts = [
        'debit'      => 'decimal:4',
        'credit'     => 'decimal:4',
        'created_at' => 'datetime',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(AccountingTransaction::class, 'trans_id');
    }

    public function chartAccount(): BelongsTo
    {
        return $this->belongsTo(ChartAccount::class, 'chartaccount_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
