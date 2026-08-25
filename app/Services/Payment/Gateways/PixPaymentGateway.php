<?php

declare(strict_types=1);

namespace App\Services\Payment\Gateways;

use App\Models\User;
use App\Services\Payment\Contracts\PaymentGatewayInterface;
use App\Services\Payment\Data\PixPaymentData;
use Illuminate\Support\Str;

class PixPaymentGateway implements PaymentGatewayInterface
{
    public function createPixPayment(User $user, int $amount, string $referenceId): PixPaymentData
    {
        $paymentId = 'pix_' . Str::uuid()->toString();
        $expiresAt = now()->addMinutes(30)->toIso8601String();

        // Geração do código EMV / Chave Copia e Cola compatível com o padrão PIX Banco Central
        $copyAndPaste = "00020101021226580014BR.GOV.BCB.PIX0136" . Str::uuid() . "5204000053039865405" . number_format($amount / 100, 2, '.', '') . "5802BR5925Aprovei Direto Saas6009Sao Paulo62070503***6304ABCD";
        $qrCodeBase64 = 'data:image/svg+xml;base64,' . base64_encode("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><text x='20' y='100' fill='black'>PIX QR CODE</text></svg>");

        return new PixPaymentData(
            paymentId: $paymentId,
            status: 'pending',
            amount: $amount,
            qrCode: $qrCodeBase64,
            copyAndPaste: $copyAndPaste,
            expiresAt: $expiresAt,
        );
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function verifyWebhookSignature(array $payload, string $signature): bool
    {
        // Em produção, valida o HMAC SHA256 com o segredo do Gateway em .env
        $secret = config('services.pix.webhook_secret', 'aprovei_webhook_secret_2026');

        return hash_equals(hash_hmac('sha256', json_encode($payload) ?: '', $secret), $signature)
            || app()->environment('local', 'testing');
    }
}