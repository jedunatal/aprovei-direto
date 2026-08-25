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

class QuestionEngineTest extends TestCase
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

    public function test_authenticated_user_can_list_questions_without_exposing_correct_option_or_explanation(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/questions');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'statement',
                        'year',
                        'difficulty',
                        'discipline' => ['id', 'name', 'slug'],
                        'topic' => ['id', 'name', 'slug'],
                        'institution' => ['id', 'name', 'slug'],
                        'options' => [
                            '*' => ['id', 'letter', 'text'],
                        ],
                    ],
                ],
                'links',
                'meta',
            ]);

        // Validação de segurança: Nunca expor o gabarito ou comentário na listagem
        $response->assertJsonMissing(['correct_option_id']);
        $response->assertJsonMissing(['explanation']);
    }

    public function test_user_answers_question_correctly_and_receives_explanation(): void
    {
        $question = Question::first();
        $correctOption = Option::find($question->correct_option_id);

        $response = $this->actingAs($this->user, 'sanctum')->postJson("/api/questions/{$question->id}/answer", [
            'selected_option_id' => $correctOption->id,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'is_correct' => true,
                'selected_option_id' => $correctOption->id,
                'correct_option_id' => $correctOption->id,
                'explanation' => $question->explanation,
            ]);

        $this->assertDatabaseHas('question_attempts', [
            'user_id' => $this->user->id,
            'question_id' => $question->id,
            'selected_option_id' => $correctOption->id,
            'is_correct' => true,
        ]);
    }

    public function test_user_answers_question_incorrectly_and_receives_feedback(): void
    {
        $question = Question::first();
        $wrongOption = Option::where('question_id', $question->id)
            ->where('id', '!=', $question->correct_option_id)
            ->first();

        $response = $this->actingAs($this->user, 'sanctum')->postJson("/api/questions/{$question->id}/answer", [
            'selected_option_id' => $wrongOption->id,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'is_correct' => false,
                'selected_option_id' => $wrongOption->id,
                'correct_option_id' => $question->correct_option_id,
                'explanation' => $question->explanation,
            ]);
    }

    public function test_cannot_answer_with_option_from_another_question(): void
    {
        $question1 = Question::first();
        $question2 = Question::where('id', '!=', $question1->id)->first();
        $optionFromQ2 = Option::where('question_id', $question2->id)->first();

        $response = $this->actingAs($this->user, 'sanctum')->postJson("/api/questions/{$question1->id}/answer", [
            'selected_option_id' => $optionFromQ2->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['selected_option_id']);
    }

    public function test_error_notebook_shows_only_questions_whose_last_attempt_was_incorrect(): void
    {
        $question = Question::first();
        $wrongOption = Option::where('question_id', $question->id)
            ->where('id', '!=', $question->correct_option_id)
            ->first();
        $correctOption = Option::find($question->correct_option_id);

        // 1. Errou a questão -> DEVE aparecer no caderno de erros
        $this->actingAs($this->user, 'sanctum')->postJson("/api/questions/{$question->id}/answer", [
            'selected_option_id' => $wrongOption->id,
        ]);

        $responseErrors = $this->actingAs($this->user, 'sanctum')->getJson('/api/questions/errors');
        $responseErrors->assertStatus(200);
        $this->assertCount(1, $responseErrors->json('data'));

        // 2. Estudou e acertou a mesma questão -> NÃO DEVE mais aparecer no caderno de erros
        $this->actingAs($this->user, 'sanctum')->postJson("/api/questions/{$question->id}/answer", [
            'selected_option_id' => $correctOption->id,
        ]);

        $responseErrorsAfter = $this->actingAs($this->user, 'sanctum')->getJson('/api/questions/errors');
        $responseErrorsAfter->assertStatus(200);
        $this->assertCount(0, $responseErrorsAfter->json('data'));
    }
}