<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Auth\CurrentUserController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

Route::post('/register', RegisterController::class)->name('register');
Route::post('/login', LoginController::class)->name('login');

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', CurrentUserController::class)->name('user');
    Route::post('/logout', LogoutController::class)->name('logout');
});