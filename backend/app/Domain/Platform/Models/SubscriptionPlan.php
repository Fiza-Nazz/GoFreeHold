<?php

namespace App\Domain\Platform\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $table = 'subscription_plans';

    protected $fillable = [
        'name',
        'code',
        'price_monthly',
        'max_properties',
        'max_units',
        'max_users',
        'features',
        'is_active',
    ];

    protected $casts = [
        'price_monthly'  => 'float',
        'max_properties' => 'integer',
        'max_units'      => 'integer',
        'max_users'      => 'integer',
        'features'       => 'array',
        'is_active'      => 'boolean',
    ];

    public function organizations(): HasMany
    {
        return $this->hasMany(Organization::class, 'plan_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }
}
