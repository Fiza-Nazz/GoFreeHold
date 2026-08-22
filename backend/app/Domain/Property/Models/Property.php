<?php

namespace App\Domain\Property\Models;

use App\Domain\Auth\Models\Owner;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    use HasFactory;

    // FLAG: type + total_units are draft extras — kept for existing UI/counts.
    protected $fillable = ['owner_id', 'name', 'address', 'city', 'description', 'type', 'total_units'];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class, 'owner_id');
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }
}
