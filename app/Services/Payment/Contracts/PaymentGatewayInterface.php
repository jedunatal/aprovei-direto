<?php

declare(strict_types=1);

namespace App\Services\Payment\Contracts;

use App\Models\User;
use App\Services\Payment\Data\PixPaymentData;

interface PaymentGatewayInterface
{
    public function createPixPayment(User $user, int $amount, string $referenceId): PixPaymentData;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function verifyWebhookSignature(array $payload, string $signature): bool;
}
