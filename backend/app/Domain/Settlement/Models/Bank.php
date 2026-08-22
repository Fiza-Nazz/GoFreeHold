<?php

namespace App\Domain\Settlement\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bank extends Model
{
    use HasFactory;

    protected $table = 'bank';

    protected $fillable = ['name'];

    public function accounts(): HasMany
    {
        return $this->hasMany(BankAccount::class);
    }
}