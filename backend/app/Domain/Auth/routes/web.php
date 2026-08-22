<?php

/**
 * Auth domain web routes (named password.reset for Laravel notification emails).
 * Loaded by AuthServiceProvider with "web" middleware.
 */

use Illuminate\Support\Facades\Route;

Route::get('/reset-password/{token}', function (string $token) {
    $frontend = rtrim(env('FRONTEND_URL', env('APP_FRONTEND_URL', 'http://localhost:5173')), '/');
    $email = request()->query('email', '');

    $url = $frontend . '/reset-password?token=' . urlencode($token);
    if ($email !== '') {
        $url .= '&email=' . urlencode($email);
    }

    return redirect()->away($url);
})->name('password.reset');
