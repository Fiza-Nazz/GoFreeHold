<?php

namespace App\Domain\Auth\Models;

use App\Models\Property;
use App\Models\Settlement;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Owner extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'name', 'contact', 'email', 'address'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function properties(): HasMany
    {
        // properties.owner_id currently references users; flagged pending client realign
        return $this->hasMany(Property::class, 'owner_id');
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class, 'owner_id');
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(Settlement::class, 'owner_id');
    }
}
