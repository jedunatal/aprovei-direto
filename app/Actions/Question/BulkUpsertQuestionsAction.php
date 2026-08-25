<?php

declare(strict_types=1);

namespace App\Actions\Question;

use App\DTOs\Question\QuestionImportItemData;
use App\Enums\ImportMode;
use App\Enums\QuestionStatus;
use App\Models\Discipline;
use App\Models\Institution;
use App\Models\Option;
use App\Models\Question;
use App\Models\Topic;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BulkUpsertQuestionsAction
{
    /**
     * @var array<string, int>
     */
    protected array $disciplineCache = [];

    /**
     * @var array<string, int>
     */
    protected array $topicCache = [];

    /**
     * @var array<string, int>
     */
    protected array $institutionCache = [];

    /**
     * @param  array<int, QuestionImportItemData>  $items
     * @return array{created: int, updated: int, skipped: int}
     */
    public function execute(array $items, ImportMode $importMode, int $userId): array
    {
        if (empty($items)) {
            return ['created' => 0, 'updated' => 0, 'skipped' => 0];
        }

        $created = 0;
        $updated = 0;
        $skipped = 0;

        DB::transaction(function () use ($items, $importMode, $userId, &$created, &$updated, &$skipped): void {
            foreach ($items as $item) {
                $disciplineId = $this->resolveDisciplineId($item->disciplineName);
                $institutionId = $this->resolveInstitutionId($item->institutionName);
                $topicId = $this->resolveTopicId($item->topicName, $disciplineId);

                $existingQuestion = null;
                if ($item->externalId !== null) {
                    $existingQuestion = Question::where('external_id', $item->externalId)->first();
                }

                if ($existingQuestion !== null) {
                    if ($importMode === ImportMode::Skip) {
                        $skipped++;

                        continue;
                    }

                    // Atualizar questão existente
                    $existingQuestion->update([
                        'discipline_id' => $disciplineId,
                        'topic_id' => $topicId,
                        'institution_id' => $institutionId,
                        'year' => $item->year,
                        'statement' => $item->statement,
                        'explanation' => $item->explanation,
                        'difficulty' => $item->difficulty,
                        'status' => $item->status,
                        'metadata' => $item->metadata,
                        'published_at' => $item->status === QuestionStatus::Published
                            ? ($existingQuestion->published_at ?? now())
                            : null,
                    ]);

                    $this->syncOptionsAndCorrectAnswer($existingQuestion, $item->options, $item->correctOptionLetter);
                    $updated++;
                } else {
                    if ($importMode === ImportMode::Update && $item->externalId !== null) {
                        // Modo somente atualização e a questão não existe
                        $skipped++;

                        continue;
                    }

                    // Criar nova questão
                    $newQuestion = Question::create([
                        'external_id' => $item->externalId,
                        'discipline_id' => $disciplineId,
                        'topic_id' => $topicId,
                        'institution_id' => $institutionId,
                        'year' => $item->year,
                        'statement' => $item->statement,
                        'explanation' => $item->explanation,
                        'difficulty' => $item->difficulty,
                        'status' => $item->status,
                        'metadata' => $item->metadata,
                        'is_active' => true,
                        'created_by' => $userId,
                        'published_at' => $item->status === QuestionStatus::Published ? now() : null,
                    ]);

                    $this->syncOptionsAndCorrectAnswer($newQuestion, $item->options, $item->correctOptionLetter);
                    $created++;
                }
            }
        });

        return [
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
        ];
    }

    protected function resolveDisciplineId(string $name): int
    {
        $normalized = trim($name);
        if ($normalized === '') {
            $normalized = 'Geral';
        }

        $cacheKey = mb_strtolower($normalized);
        if (isset($this->disciplineCache[$cacheKey])) {
            return $this->disciplineCache[$cacheKey];
        }

        $discipline = Discipline::firstOrCreate(
            ['name' => $normalized],
            ['slug' => Str::slug($normalized), 'is_active' => true]
        );

        $this->disciplineCache[$cacheKey] = $discipline->id;

        return $discipline->id;
    }

    protected function resolveInstitutionId(string $name): int
    {
        $normalized = trim($name);
        if ($normalized === '') {
            $normalized = 'Geral';
        }

        $cacheKey = mb_strtolower($normalized);
        if (isset($this->institutionCache[$cacheKey])) {
            return $this->institutionCache[$cacheKey];
        }

        $institution = Institution::firstOrCreate(
            ['name' => $normalized],
            ['slug' => Str::slug($normalized), 'is_active' => true]
        );

        $this->institutionCache[$cacheKey] = $institution->id;

        return $institution->id;
    }

    protected function resolveTopicId(string $name, int $disciplineId): int
    {
        $normalized = trim($name);
        if ($normalized === '') {
            $normalized = 'Tópico Geral';
        }

        $cacheKey = mb_strtolower($normalized).':'.$disciplineId;
        if (isset($this->topicCache[$cacheKey])) {
            return $this->topicCache[$cacheKey];
        }

        $topic = Topic::firstOrCreate(
            [
                'discipline_id' => $disciplineId,
                'name' => $normalized,
            ],
            [
                'slug' => Str::slug($normalized),
                'is_active' => true,
            ]
        );

        $this->topicCache[$cacheKey] = $topic->id;

        return $topic->id;
    }

    /**
     * @param  array<int, array{letter: string, text: string}>  $optionsData
     */
    protected function syncOptionsAndCorrectAnswer(Question $question, array $optionsData, string $correctLetter): void
    {
        $correctOptionId = null;

        foreach ($optionsData as $opt) {
            $letter = strtoupper(trim($opt['letter']));
            $text = trim($opt['text']);

            $option = Option::updateOrCreate(
                [
                    'question_id' => $question->id,
                    'letter' => $letter,
                ],
                [
                    'text' => $text,
                ]
            );

            if ($letter === $correctLetter) {
                $correctOptionId = $option->id;
            }
        }

        // Se encontrou a opção correta, atualiza a foreign key da questão
        if ($correctOptionId !== null) {
            $question->updateQuietly([
                'correct_option_id' => $correctOptionId,
            ]);
        }
    }
}
