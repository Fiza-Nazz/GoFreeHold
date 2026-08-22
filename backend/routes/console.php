<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('rent:post-monthly')->monthlyOn(1, '00:00');
Schedule::command('alert:contract-expiry')->dailyAt('08:00');
Schedule::command('alert:pending-cheques')->dailyAt('09:00');
Schedule::command('alert:vacant-properties')->weeklyOn(1, '09:00');
Schedule::command('alert:monthly-dues')->monthlyOn(1, '01:00');
