<?php

declare(strict_types=1);

use App\Http\Controllers\Api\DisciplineController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/', DisciplineController::class)->name('index');
});