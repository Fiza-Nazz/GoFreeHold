<?php

namespace App\Domain\Report\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'enabled',
        'recipient_email',
        'days_before_expiry',
        'description',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];
}