<?php

namespace App\Domain\Settlement\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = ['bank_id', 'account_name', 'account_number', 'iban', 'branch'];

    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
    }
}