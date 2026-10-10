<?php

namespace App\Domain\Platform\Models;

use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Organization extends Model
{
    use HasFactory;

    protected $table = 'organizations';

    protected $fillable = [
        'name',
        'slug',
        'status',
        'plan_id',
        'owner_user_id',
        'trial_ends_at',
        'subscribed_at',
        'suspended_at',
        'notes',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'subscribed_at' => 'datetime',
        'suspended_at'  => 'datetime',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'organization_id');
    }

    public function currentSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class, 'organization_id')->latestOfMany();
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'organization_id');
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'organization_id');
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class, 'organization_id');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'organization_id');
    }
}
