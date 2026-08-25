<?php

declare(strict_types=1);

namespace App\Actions\Subscription;

use App\Enums\SubscriptionStatus;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProcessPaymentWebhookAction
{
    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    public function execute(array $payload): array
    {
        $paymentId = (string) ($payload['payment_id'] ?? '');
        $status = (string) ($payload['status'] ?? '');

        if ($paymentId === '') {
            throw ValidationException::withMessages([
                'payment_id' => ['O identificador do pagamento é obrigatório.'],
            ]);
        }

        return DB::transaction(function () use ($paymentId, $status, $payload): array {
            // LockForUpdate garante estrita idempotência mesmo com requisições concorrentes
            $payment = Payment::where('gateway_payment_id', $paymentId)
                ->lockForUpdate()
                ->first();

            if (! $payment) {
                throw ValidationException::withMessages([
                    'payment_id' => ['Registro de pagamento não localizado.'],
                ]);
            }

            // Se já foi pago, retorna sucesso imediatamente (idempotente)
            if ($payment->status === 'approved' || $payment->status === 'paid') {
                return [
                    'processed' => false,
                    'message' => 'Pagamento já processado anteriormente.',
                    'payment_id' => $payment->gateway_payment_id,
                ];
            }

            if ($status === 'approved' || $status === 'paid') {
                $payment->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'raw_response' => $payload,
                ]);

                $subscription = $payment->subscription;
                $durationDays = ($subscription->plan === 'annual') ? 365 : 30;

                $subscription->update([
                    'status' => SubscriptionStatus::Active,
                    'starts_at' => now(),
                    'expires_at' => now()->addDays($durationDays),
                ]);

                return [
                    'processed' => true,
                    'message' => 'Assinatura ativada com sucesso.',
                    'payment_id' => $payment->gateway_payment_id,
                    'expires_at' => $subscription->expires_at?->toIso8601String(),
                ];
            }

            return [
                'processed' => false,
                'message' => 'Status do pagamento não aprovado.',
                'payment_id' => $payment->gateway_payment_id,
            ];
        });
    }
}