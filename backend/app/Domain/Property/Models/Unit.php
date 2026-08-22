<?php

namespace App\Domain\Property\Models;

use App\Domain\Auth\Models\Owner;
use App\Models\Contract;
use App\Models\UnitItem;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory;

    // status: AVAILABLE | BOOKED | OCCUPIED | SOLD
    protected $fillable = [
        'property_id',
        'owner_id',
        'number',
        'dhewa_no',
        'category',
        'type',
        'floor',
        'size',
        'furnished',
        'price',
        'status',
    ];

    protected $casts = [
        'furnished' => 'boolean',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class, 'owner_id');
    }

    public function unitItems(): HasMany
    {
        return $this->hasMany(UnitItem::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }
}
