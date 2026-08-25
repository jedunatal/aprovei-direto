<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Enums\Difficulty;
use App\Enums\QuestionStatus;
use App\Enums\Role;
use App\Models\Discipline;
use App\Models\Institution;
use App\Models\Question;
use App\Models\Topic;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminQuestionCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $teacher;

    protected User $student;

    protected Discipline $discipline;

    protected Topic $topic;

    protected Institution $institution;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole(Role::Admin->value);

        $this->teacher = User::factory()->create();
        $this->teacher->assignRole(Role::Teacher->value);

        $this->student = User::factory()->create();
        $this->student->assignRole(Role::Student->value);

        $this->discipline = Discipline::create(['name' => 'Direito Civil', 'slug' => 'direito-civil', 'is_active' => true]);
        $this->topic = Topic::create(['discipline_id' => $this->discipline->id, 'name' => 'Contratos', 'slug' => 'contratos', 'is_active' => true]);
        $this->institution = Institution::create(['name' => 'FCC', 'slug' => 'fcc', 'is_active' => true]);
    }

    public function test_admin_can_create_question_with_options_and_correct_option(): void
    {
        $payload = [
            'external_id' => 'FCC-CIVIL-2026',
            'discipline_id' => $this->discipline->id,
            'topic_id' => $this->topic->id,
            'institution_id' => $this->institution->id,
            'year' => 2026,
            'difficulty' => 'hard',
            'status' => 'published',
            'statement' => 'Nos contratos bilaterais, nenhum dos contratantes...',
            'explanation' => 'Exceção do contrato não cumprido (Art. 476 do CC).',
            'options' => [
                ['letter' => 'A', 'text' => 'Pode exigir o cumprimento antes de cumprir a sua obrigação.'],
                ['letter' => 'B', 'text' => 'Não pode exigir o cumprimento antes de cumprir a sua obrigação.'],
            ],
            'correct_option' => 'B',
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/questions', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.external_id', 'FCC-CIVIL-2026')
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.correct_option_letter', 'B');

        $this->assertDatabaseHas('questions', [
            'external_id' => 'FCC-CIVIL-2026',
            'statement' => 'Nos contratos bilaterais, nenhum dos contratantes...',
            'status' => 'published',
        ]);
    }

    public function test_admin_can_filter_and_search_questions(): void
    {
        Question::create([
            'discipline_id' => $this->discipline->id,
            'topic_id' => $this->topic->id,
            'institution_id' => $this->institution->id,
            'year' => 2026,
            'difficulty' => Difficulty::Medium,
            'status' => QuestionStatus::Draft,
            'statement' => 'Questão rascunho de Direito Civil Especial',
            'explanation' => 'Comentário explicativo...',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/questions?status=draft&search=Especial');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'draft');
    }

    public function test_admin_can_update_question_status_from_review_to_published(): void
    {
        $question = Question::create([
            'discipline_id' => $this->discipline->id,
            'topic_id' => $this->topic->id,
            'institution_id' => $this->institution->id,
            'year' => 2026,
            'difficulty' => Difficulty::Easy,
            'status' => QuestionStatus::Review,
            'statement' => 'Questão para curadoria e revisão...',
            'explanation' => 'Explicação técnica...',
            'created_by' => $this->teacher->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/questions/{$question->id}/status", [
                'status' => 'published',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.reviewed_by.id', $this->admin->id);

        $question->refresh();
        $this->assertEquals(QuestionStatus::Published, $question->status);
        $this->assertNotNull($question->published_at);
    }

    public function test_student_cannot_see_draft_or_review_questions_in_public_feed(): void
    {
        // Cria 1 publicada e 1 rascunho
        Question::create([
            'discipline_id' => $this->discipline->id,
            'topic_id' => $this->topic->id,
            'institution_id' => $this->institution->id,
            'year' => 2026,
            'difficulty' => Difficulty::Easy,
            'status' => QuestionStatus::Published,
            'statement' => 'Questão pública disponível aos estudantes.',
            'explanation' => 'Explicação pública...',
            'is_active' => true,
        ]);

        Question::create([
            'discipline_id' => $this->discipline->id,
            'topic_id' => $this->topic->id,
            'institution_id' => $this->institution->id,
            'year' => 2026,
            'difficulty' => Difficulty::Easy,
            'status' => QuestionStatus::Draft,
            'statement' => 'Questão em rascunho oculta para estudantes.',
            'explanation' => 'Explicação privada...',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->student, 'sanctum')
            ->getJson('/api/questions');

        $response->assertOk()
            ->assertJsonCount(1, 'data'); // Apenas a publicada aparece
    }

    public function test_admin_can_delete_question(): void
    {
        $question = Question::create([
            'discipline_id' => $this->discipline->id,
            'topic_id' => $this->topic->id,
            'institution_id' => $this->institution->id,
            'year' => 2026,
            'difficulty' => Difficulty::Medium,
            'status' => QuestionStatus::Published,
            'statement' => 'Questão a ser excluída...',
            'explanation' => 'Comentário...',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/questions/{$question->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Questão removida com sucesso.');

        $this->assertDatabaseMissing('questions', ['id' => $question->id]);
    }
}
