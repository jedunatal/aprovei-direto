<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Enums\ImportBatchStatus;
use App\Enums\ImportMode;
use App\Enums\Role;
use App\Models\Question;
use App\Models\QuestionImportBatch;
use App\Models\User;
use App\Services\Question\QuestionImportService;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class QuestionImportTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);

        $this->admin = User::factory()->create();
        $this->admin->assignRole(Role::Admin->value);

        $this->student = User::factory()->create();
        $this->student->assignRole(Role::Student->value);

        Storage::fake('local');
    }

    public function test_admin_can_upload_json_file_and_dispatch_import_job(): void
    {
        Queue::fake();

        $jsonData = [
            [
                'external_id' => 'FGV-2026-001',
                'discipline' => 'Direito Constitucional',
                'topic' => 'Direitos Fundamentais',
                'institution' => 'FGV',
                'year' => 2026,
                'difficulty' => 'medium',
                'statement' => 'Sobre os direitos fundamentais, assinale a correta.',
                'explanation' => 'Comentário sobre direitos fundamentais.',
                'options' => [
                    ['letter' => 'A', 'text' => 'Opção A'],
                    ['letter' => 'B', 'text' => 'Opção B'],
                    ['letter' => 'C', 'text' => 'Opção C'],
                ],
                'correct_option' => 'B',
            ],
        ];

        $file = UploadedFile::fake()->createWithContent('questions.json', json_encode($jsonData));

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/questions/import', [
                'file' => $file,
                'import_mode' => 'skip',
            ]);

        $response->assertAccepted()
            ->assertJsonPath('data.file_name', 'questions.json')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('question_import_batches', [
            'file_name' => 'questions.json',
            'status' => 'pending',
            'import_mode' => 'skip',
        ]);
    }

    public function test_service_can_process_json_array_file_and_save_to_mysql(): void
    {
        $jsonData = [
            [
                'external_id' => 'FGV-2026-001',
                'discipline' => 'Direito Administrativo',
                'topic' => 'Atos Administrativos',
                'institution' => 'FGV',
                'year' => 2026,
                'difficulty' => 'hard',
                'statement' => 'Qual o elemento do ato administrativo?',
                'explanation' => 'Competência, finalidade, forma, motivo e objeto.',
                'options' => [
                    ['letter' => 'A', 'text' => 'Competência'],
                    ['letter' => 'B', 'text' => 'Incompetência'],
                ],
                'correct_option' => 'A',
            ],
        ];

        $filePath = 'imports/test_questions.json';
        Storage::put($filePath, json_encode($jsonData));

        $batch = QuestionImportBatch::create([
            'user_id' => $this->admin->id,
            'file_name' => 'test_questions.json',
            'file_path' => $filePath,
            'file_size' => 1024,
            'import_mode' => ImportMode::Skip,
            'status' => ImportBatchStatus::Pending,
        ]);

        /** @var QuestionImportService $service */
        $service = app(QuestionImportService::class);
        $service->processBatch($batch);

        $batch->refresh();
        $this->assertEquals(ImportBatchStatus::Completed, $batch->status);
        $this->assertEquals(1, $batch->total_records);
        $this->assertEquals(1, $batch->successful_records);
        $this->assertEquals(0, $batch->failed_records);

        $this->assertDatabaseHas('questions', [
            'external_id' => 'FGV-2026-001',
            'year' => 2026,
            'difficulty' => 'hard',
        ]);

        $question = Question::where('external_id', 'FGV-2026-001')->first();
        $this->assertNotNull($question);
        $this->assertCount(2, $question->options);
        $this->assertEquals('A', $question->correctOption->letter);
    }

    public function test_service_can_process_ndjson_line_by_line(): void
    {
        $line1 = json_encode([
            'external_id' => 'CEBRASPE-2026-001',
            'discipline' => 'Português',
            'topic' => 'Crase',
            'institution' => 'Cebraspe',
            'year' => 2026,
            'difficulty' => 'easy',
            'statement' => 'Uso correto da crase.',
            'explanation' => 'Explicando o uso da crase.',
            'options' => [
                ['letter' => 'C', 'text' => 'Certo'],
                ['letter' => 'E', 'text' => 'Errado'],
            ],
            'correct_option' => 'C',
        ]);

        $line2 = json_encode([
            'external_id' => 'CEBRASPE-2026-002',
            'discipline' => 'Português',
            'topic' => 'Pontuação',
            'institution' => 'Cebraspe',
            'year' => 2026,
            'difficulty' => 'medium',
            'statement' => 'Uso da vírgula.',
            'explanation' => 'Explicando o uso da vírgula.',
            'options' => [
                ['letter' => 'C', 'text' => 'Certo'],
                ['letter' => 'E', 'text' => 'Errado'],
            ],
            'correct_option' => 'E',
        ]);

        $ndjsonContent = $line1."\n".$line2."\n";
        $filePath = 'imports/test_questions.ndjson';
        Storage::put($filePath, $ndjsonContent);

        $batch = QuestionImportBatch::create([
            'user_id' => $this->admin->id,
            'file_name' => 'test_questions.ndjson',
            'file_path' => $filePath,
            'file_size' => strlen($ndjsonContent),
            'import_mode' => ImportMode::Upsert,
            'status' => ImportBatchStatus::Pending,
        ]);

        /** @var QuestionImportService $service */
        $service = app(QuestionImportService::class);
        $service->processBatch($batch);

        $batch->refresh();
        $this->assertEquals(ImportBatchStatus::Completed, $batch->status);
        $this->assertEquals(2, $batch->total_records);
        $this->assertEquals(2, $batch->successful_records);
        $this->assertEquals(0, $batch->failed_records);

        $this->assertDatabaseHas('questions', ['external_id' => 'CEBRASPE-2026-001']);
        $this->assertDatabaseHas('questions', ['external_id' => 'CEBRASPE-2026-002']);
    }

    public function test_service_records_partial_errors_without_crashing_batch(): void
    {
        $validItem = [
            'external_id' => 'VUNESP-001',
            'discipline' => 'Raciocínio Lógico',
            'topic' => 'Tautologia',
            'institution' => 'VUNESP',
            'year' => 2026,
            'difficulty' => 'easy',
            'statement' => 'Questão sobre tautologia.',
            'explanation' => 'Tautologia é sempre verdadeira.',
            'options' => [
                ['letter' => 'A', 'text' => 'V'],
                ['letter' => 'B', 'text' => 'F'],
            ],
            'correct_option' => 'A',
        ];

        $invalidItem = [
            'external_id' => 'VUNESP-002',
            'discipline' => 'Raciocínio Lógico',
            'topic' => 'Tautologia',
            'institution' => 'VUNESP',
            'year' => 2026,
            'difficulty' => 'easy',
            'statement' => '', // Enunciado vazio -> Erro de validação
            'explanation' => 'Explicando...',
            'options' => [
                ['letter' => 'A', 'text' => 'V'],
                ['letter' => 'B', 'text' => 'F'],
            ],
            'correct_option' => 'C', // Gabarito inexistente nas opções
        ];

        $filePath = 'imports/partial.json';
        Storage::put($filePath, json_encode([$validItem, $invalidItem]));

        $batch = QuestionImportBatch::create([
            'user_id' => $this->admin->id,
            'file_name' => 'partial.json',
            'file_path' => $filePath,
            'file_size' => 1024,
            'import_mode' => ImportMode::Skip,
            'status' => ImportBatchStatus::Pending,
        ]);

        /** @var QuestionImportService $service */
        $service = app(QuestionImportService::class);
        $service->processBatch($batch);

        $batch->refresh();
        $this->assertEquals(ImportBatchStatus::Completed, $batch->status);
        $this->assertEquals(2, $batch->total_records);
        $this->assertEquals(1, $batch->successful_records);
        $this->assertEquals(1, $batch->failed_records);

        $this->assertDatabaseHas('questions', ['external_id' => 'VUNESP-001']);
        $this->assertDatabaseMissing('questions', ['external_id' => 'VUNESP-002']);

        $this->assertDatabaseHas('question_import_errors', [
            'import_batch_id' => $batch->id,
            'line_number' => 2,
            'external_id' => 'VUNESP-002',
        ]);
    }

    public function test_student_cannot_access_import_endpoints(): void
    {
        $response = $this->actingAs($this->student, 'sanctum')
            ->getJson('/api/admin/questions/imports');

        $response->assertForbidden();
    }
}
