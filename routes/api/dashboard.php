<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Dashboard\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/stats', DashboardController::class)->name('stats');
});
