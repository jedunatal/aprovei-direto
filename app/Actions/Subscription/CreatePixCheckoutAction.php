<?php

declare(strict_types=1);

namespace App\Actions\Subscription;

use App\Enums\SubscriptionStatus;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Payment\Contracts\PaymentGatewayInterface;
use App\Services\Payment\Data\PixPaymentData;
use Illuminate\Support\Facades\DB;

class CreatePixCheckoutAction
{
    public function __construct(
        private readonly PaymentGatewayInterface $gateway,
    ) {}

    public function execute(User $user, string $plan = 'monthly'): PixPaymentData
    {
        // Tabela de preços: R$ 29,90 mensal | R$ 199,90 anual
        $amount = ($plan === 'annual') ? 19990 : 2990;

        return DB::transaction(function () use ($user, $plan, $amount): PixPaymentData {
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'gateway' => 'pix',
                'plan' => $plan,
                'status' => SubscriptionStatus::Pending,
                'amount' => $amount,
            ]);

            $pixData = $this->gateway->createPixPayment($user, $amount, (string) $subscription->id);

            Payment::create([
                'subscription_id' => $subscription->id,
                'gateway' => 'pix',
                'gateway_payment_id' => $pixData->paymentId,
                'amount' => $amount,
                'status' => 'pending',
                'raw_response' => $pixData->toArray(),
            ]);

            return $pixData;
        });
    }
}