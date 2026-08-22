<?php

namespace App\Domain\Maintenance\Models;

use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceCharge extends Model
{
    use HasFactory;

    protected $fillable = ['job_id', 'unit_id', 'description', 'amount', 'status'];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}