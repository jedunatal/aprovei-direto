<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Admin\AdminQuestionController;
use App\Http\Controllers\Api\Admin\QuestionImportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function (): void {
    // Importações de Questões
    Route::get('/questions/imports', [QuestionImportController::class, 'index'])->name('questions.imports.index');
    Route::post('/questions/import', [QuestionImportController::class, 'store'])->name('questions.import.store');
    Route::get('/questions/imports/{batch}', [QuestionImportController::class, 'show'])->name('questions.imports.show');
    Route::get('/questions/imports/{batch}/errors', [QuestionImportController::class, 'errors'])->name('questions.imports.errors');
    Route::post('/questions/imports/{batch}/cancel', [QuestionImportController::class, 'cancel'])->name('questions.imports.cancel');

    // CRUD e Curadoria de Questões
    Route::get('/questions', [AdminQuestionController::class, 'index'])->name('questions.index');
    Route::post('/questions', [AdminQuestionController::class, 'store'])->name('questions.store');
    Route::get('/questions/{question}', [AdminQuestionController::class, 'show'])->name('questions.show');
    Route::put('/questions/{question}', [AdminQuestionController::class, 'update'])->name('questions.update');
    Route::delete('/questions/{question}', [AdminQuestionController::class, 'destroy'])->name('questions.destroy');
    Route::patch('/questions/{question}/status', [AdminQuestionController::class, 'updateStatus'])->name('questions.update_status');
});
