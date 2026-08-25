<?php

declare(strict_types=1);

namespace App\Services\Payment\Data;

readonly class PixPaymentData
{
    public function __construct(
        public string $paymentId,
        public string $status,
        public int $amount,
        public string $qrCode,
        public string $copyAndPaste,
        public string $expiresAt,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'payment_id' => $this->paymentId,
            'status' => $this->status,
            'amount' => $this->amount,
            'qr_code' => $this->qrCode,
            'copy_and_paste' => $this->copyAndPaste,
            'expires_at' => $this->expiresAt,
        ];
    }
}