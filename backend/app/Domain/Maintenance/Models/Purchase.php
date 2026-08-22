<?php

namespace App\Domain\Maintenance\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Purchase extends Model
{
    use HasFactory;

    // status: pending, received, cancelled
    protected $fillable = [
        'supplier_name',
        'purchase_date',
        'total_amount',
        'status',
        'remark',
    ];

    protected $casts = [
        'purchase_date' => 'date',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }
}