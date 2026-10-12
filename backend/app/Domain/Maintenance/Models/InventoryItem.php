<?php

namespace App\Domain\Maintenance\Models;

use App\Domain\Auth\Models\Owner;
use App\Domain\Platform\Models\Organization;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'owner_id',
        'item_kind',       // stock | asset
        'location_type',   // warehouse | unit
        'location_id',     // legacy fallback, kept in sync with unit_id or 0
        'unit_id',         // null if warehouse stock, set if unit-assigned
        'name',
        'category',
        'quantity',
        'unit_price',
        'unit_cost',
        'min_stock_alert',
        'brand',
        'model',
        'serial_number',
        'purchase_date',
        'warranty_expiry',
        'condition',       // brand_new | good | needs_repair | replaced
        'notes',
        'sku',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'min_stock_alert' => 'decimal:2',
            'purchase_date' => 'date',
            'warranty_expiry' => 'date',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class, 'inventory_item_id');
    }

    public function scopeWarehouse(Builder $query): Builder
    {
        return $query->where('location_type', 'warehouse');
    }

    public function scopeUnit(Builder $query): Builder
    {
        return $query->where('location_type', 'unit');
    }

    public function scopeStock(Builder $query): Builder
    {
        return $query->where('item_kind', 'stock');
    }

    public function scopeAssets(Builder $query): Builder
    {
        return $query->where('item_kind', 'asset');
    }
}