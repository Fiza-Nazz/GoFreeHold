<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/*
| Named password.reset route lives in Auth domain:
|   app/Domain/Auth/routes/web.php
| registered by AuthServiceProvider.
*/
