<?php

namespace App\Domain\Maintenance\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Team extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'phone', 'remark'];

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class);
    }
}