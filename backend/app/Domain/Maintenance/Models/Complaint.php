<?php

namespace App\Domain\Maintenance\Models;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'unit_id',
        'title',
        'description',
        'category',
        'priority',
        'status',
        'assigned_to',
        'created_by',
        'source',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function job(): HasOne
    {
        return $this->hasOne(Job::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ComplaintAttachment::class);
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ComplaintUpdate::class)->latest();
    }
}
