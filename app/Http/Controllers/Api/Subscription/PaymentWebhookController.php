<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Subscription;

use App\Actions\Subscription\ProcessPaymentWebhookAction;
use App\Http\Controllers\Controller;
use App\Services\Payment\Contracts\PaymentGatewayInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentWebhookController extends Controller
{
    public function __invoke(
        Request $request,
        ProcessPaymentWebhookAction $action,
        PaymentGatewayInterface $gateway
    ): JsonResponse {
        $signature = $request->header('X-Signature', '');

        if (! $gateway->verifyWebhookSignature($request->all(), $signature)) {
            return response()->json(['message' => 'Assinatura do webhook inválida.'], 403);
        }

        $result = $action->execute($request->all());

        return response()->json($result, 200);
    }
}
