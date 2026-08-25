<?php

declare(strict_types=1);

use App\Http\Controllers\Api\Subscription\PaymentWebhookController;
use Illuminate\Support\Facades\Route;

// Webhook de Pagamento (Público com validação por chave/assinatura)
Route::post('/webhook', PaymentWebhookController::class)->name('webhook');