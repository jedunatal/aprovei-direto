<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Enums\SubscriptionStatus;
use App\Models\Subscription;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->student = User::factory()->create();
    }

    public function test_user_can_generate_pix_checkout(): void
    {
        $response = $this->actingAs($this->student, 'sanctum')->postJson('/api/subscriptions/checkout', [
            'plan' => 'monthly',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'payment_id',
                'status',
                'amount',
                'qr_code',
                'copy_and_paste',
                'expires_at',
            ]);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $this->student->id,
            'plan' => 'monthly',
            'status' => SubscriptionStatus::Pending->value,
            'amount' => 2990,
        ]);

        $this->assertDatabaseHas('payments', [
            'gateway_payment_id' => $response->json('payment_id'),
            'amount' => 2990,
            'status' => 'pending',
        ]);
    }

    public function test_webhook_approves_payment_and_activates_subscription(): void
    {
        // 1. Gera o Checkout inicial
        $checkout = $this->actingAs($this->student, 'sanctum')->postJson('/api/subscriptions/checkout', [
            'plan' => 'monthly',
        ]);

        $paymentId = $checkout->json('payment_id');

        // 2. Gateway envia o Webhook confirmando o pagamento
        $response = $this->postJson('/api/payments/webhook', [
            'payment_id' => $paymentId,
            'status' => 'paid',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'processed' => true,
                'message' => 'Assinatura ativada com sucesso.',
                'payment_id' => $paymentId,
            ]);

        // Validação no Banco de Dados
        $this->assertDatabaseHas('payments', [
            'gateway_payment_id' => $paymentId,
            'status' => 'paid',
        ]);

        $subscription = Subscription::where('user_id', $this->student->id)->first();
        $this->assertEquals(SubscriptionStatus::Active, $subscription->status);
        $this->assertTrue($subscription->isActive());
        $this->assertTrue($this->student->fresh()->hasActiveSubscription());
    }

    public function test_webhook_is_strictly_idempotent(): void
    {
        $checkout = $this->actingAs($this->student, 'sanctum')->postJson('/api/subscriptions/checkout', [
            'plan' => 'monthly',
        ]);
        $paymentId = $checkout->json('payment_id');

        // Primeira chamada: Processa e Ativa
        $this->postJson('/api/payments/webhook', [
            'payment_id' => $paymentId,
            'status' => 'paid',
        ])->assertStatus(200);

        // Segunda chamada (Duplicada / Reenvio de rede): Não deve duplicar nem falhar
        $responseDuplicate = $this->postJson('/api/payments/webhook', [
            'payment_id' => $paymentId,
            'status' => 'paid',
        ]);

        $responseDuplicate->assertStatus(200)
            ->assertJson([
                'processed' => false,
                'message' => 'Pagamento já processado anteriormente.',
            ]);
    }

    public function test_subscription_status_endpoint_returns_correct_state(): void
    {
        // Aluno sem assinatura
        $responseEmpty = $this->actingAs($this->student, 'sanctum')->getJson('/api/subscriptions/status');
        $responseEmpty->assertStatus(200)->assertJson(['has_subscription' => false]);

        // Aluno com assinatura ativa criada
        Subscription::create([
            'user_id' => $this->student->id,
            'gateway' => 'pix',
            'plan' => 'monthly',
            'status' => SubscriptionStatus::Active,
            'amount' => 2990,
            'starts_at' => now(),
            'expires_at' => now()->addDays(30),
        ]);

        $responseActive = $this->actingAs($this->student, 'sanctum')->getJson('/api/subscriptions/status');
        $responseActive->assertStatus(200)
            ->assertJson([
                'has_subscription' => true,
                'subscription' => [
                    'plan' => 'monthly',
                    'status' => 'active',
                    'is_active' => true,
                ],
            ]);
    }
}
