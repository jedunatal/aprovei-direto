<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Modular API Routes
|--------------------------------------------------------------------------
*/

Route::group([], __DIR__.'/api/health.php');

Route::prefix('auth')->name('auth.')->group(__DIR__.'/api/auth.php');
Route::prefix('admin')->name('admin.')->group(__DIR__.'/api/admin.php');
Route::prefix('questions')->name('questions.')->group(__DIR__.'/api/questions.php');
Route::prefix('disciplines')->name('disciplines.')->group(__DIR__.'/api/disciplines.php');
Route::prefix('topics')->name('topics.')->group(__DIR__.'/api/topics.php');
Route::prefix('institutions')->name('institutions.')->group(__DIR__.'/api/institutions.php');
Route::prefix('dashboard')->name('dashboard.')->group(__DIR__.'/api/dashboard.php');
Route::prefix('subscriptions')->name('subscriptions.')->group(__DIR__.'/api/subscriptions.php');
Route::prefix('payments')->name('payments.')->group(__DIR__.'/api/payments.php');
