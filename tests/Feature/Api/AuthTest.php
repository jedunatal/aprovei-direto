<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_user_can_register_via_api_and_receives_token(): void
    {
        $payload = [
            'name' => 'Jorge Brito',
            'email' => 'jorge.teste@aproveidireto.com.br',
            'password' => 'SenhaForte#2026',
            'password_confirmation' => 'SenhaForte#2026',
        ];

        $response = $this->postJson('/api/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'access_token',
                'token_type',
                'user' => ['id', 'name', 'email', 'created_at'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'jorge.teste@aproveidireto.com.br',
            'name' => 'Jorge Brito',
        ]);
    }

    public function test_user_can_login_via_api_and_receives_token(): void
    {
        $user = User::factory()->create([
            'email' => 'estudante@aproveidireto.com.br',
            'password' => bcrypt('SenhaForte#2026'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'estudante@aproveidireto.com.br',
            'password' => 'SenhaForte#2026',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'access_token',
                'token_type',
                'user' => ['id', 'name', 'email'],
            ]);
    }

    public function test_login_fails_with_incorrect_password(): void
    {
        User::factory()->create([
            'email' => 'estudante@aproveidireto.com.br',
            'password' => bcrypt('SenhaForte#2026'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'estudante@aproveidireto.com.br',
            'password' => 'SenhaErrada123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/auth/user');

        $response->assertStatus(200)
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                ],
            ]);
    }

    public function test_authenticated_user_can_logout_and_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Sessão encerrada com sucesso.']);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
