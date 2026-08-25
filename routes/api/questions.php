<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Question\QuestionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/errors', [QuestionController::class, 'errors'])->name('errors');
    Route::get('/', [QuestionController::class, 'index'])->name('index');
    Route::get('/{question}', [QuestionController::class, 'show'])->name('show');
    Route::post('/{question}/answer', [QuestionController::class, 'answer'])->name('answer');
});
