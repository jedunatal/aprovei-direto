<?php

declare(strict_types=1);

namespace Tests\Feature\Api;

use App\Models\Option;
use App\Models\Question;
use App\Models\User;
use Database\Seeders\QuestionSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
        $this->seed(QuestionSeeder::class);

        $this->user = User::factory()->create();
    }

    public function test_dashboard_returns_empty_stats_for_new_user(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJson([
                'overview' => [
                    'answered' => 0,
                    'correct' => 0,
                    'incorrect' => 0,
                    'accuracy' => 0,
                ],
                'disciplines' => [],
                'daily' => [],
                'errors' => [],
            ]);
    }

    public function test_dashboard_calculates_performance_and_evolution_accurately(): void
    {
        $questions = Question::all();
        $q1 = $questions[0];
        $q2 = $questions[1];

        $correctOptQ1 = Option::find($q1->correct_option_id);
        $wrongOptQ2 = Option::where('question_id', $q2->id)
            ->where('id', '!=', $q2->correct_option_id)
            ->first();

        // 1. Responde Q1 Corretamente
        $this->actingAs($this->user, 'sanctum')->postJson("/api/questions/{$q1->id}/answer", [
            'selected_option_id' => $correctOptQ1->id,
        ]);

        // 2. Responde Q2 Incorretamente
        $this->actingAs($this->user, 'sanctum')->postJson("/api/questions/{$q2->id}/answer", [
            'selected_option_id' => $wrongOptQ2->id,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'overview' => ['answered', 'correct', 'incorrect', 'accuracy'],
                'disciplines' => [
                    '*' => ['id', 'name', 'slug', 'answered', 'correct', 'incorrect', 'accuracy'],
                ],
                'daily' => [
                    '*' => ['date', 'answered', 'correct', 'incorrect'],
                ],
                'errors' => [
                    '*' => ['id', 'statement', 'discipline', 'topic', 'institution'],
                ],
            ])
            ->assertJson([
                'overview' => [
                    'answered' => 2,
                    'correct' => 1,
                    'incorrect' => 1,
                    'accuracy' => 50.0,
                ],
            ]);

        // A questão errada (Q2) deve constar na lista de erros rápidos
        $this->assertCount(1, $response->json('errors'));
        $this->assertEquals($q2->id, $response->json('errors.0.id'));
    }
}
