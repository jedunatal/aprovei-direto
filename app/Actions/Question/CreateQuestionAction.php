<?php

declare(strict_types=1);

namespace App\Actions\Question;

use App\Enums\Difficulty;
use App\Enums\QuestionStatus;
use App\Models\Discipline;
use App\Models\Institution;
use App\Models\Option;
use App\Models\Question;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateQuestionAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, array $data): Question
    {
        return DB::transaction(function () use ($user, $data): Question {
            $disciplineId = (int) ($data['discipline_id'] ?? 0);
            if ($disciplineId === 0 && isset($data['discipline_name'])) {
                $disc = Discipline::firstOrCreate(
                    ['name' => trim((string) $data['discipline_name'])],
                    ['slug' => Str::slug(trim((string) $data['discipline_name'])), 'is_active' => true]
                );
                $disciplineId = $disc->id;
            }

            $topicId = (int) ($data['topic_id'] ?? 0);
            if ($topicId === 0 && isset($data['topic_name'])) {
                $topic = Topic::firstOrCreate(
                    ['discipline_id' => $disciplineId, 'name' => trim((string) $data['topic_name'])],
                    ['slug' => Str::slug(trim((string) $data['topic_name'])), 'is_active' => true]
                );
                $topicId = $topic->id;
            }

            $institutionId = (int) ($data['institution_id'] ?? 0);
            if ($institutionId === 0 && isset($data['institution_name'])) {
                $inst = Institution::firstOrCreate(
                    ['name' => trim((string) $data['institution_name'])],
                    ['slug' => Str::slug(trim((string) $data['institution_name'])), 'is_active' => true]
                );
                $institutionId = $inst->id;
            }

            $status = isset($data['status'])
                ? QuestionStatus::from((string) $data['status'])
                : QuestionStatus::Published;

            $question = Question::create([
                'external_id' => isset($data['external_id']) && trim((string) $data['external_id']) !== ''
                    ? trim((string) $data['external_id'])
                    : null,
                'discipline_id' => $disciplineId,
                'topic_id' => $topicId,
                'institution_id' => $institutionId,
                'year' => (int) ($data['year'] ?? date('Y')),
                'statement' => trim((string) $data['statement']),
                'explanation' => trim((string) ($data['explanation'] ?? '')),
                'difficulty' => isset($data['difficulty'])
                    ? Difficulty::from((string) $data['difficulty'])
                    : Difficulty::Medium,
                'status' => $status,
                'metadata' => $data['metadata'] ?? null,
                'is_active' => (bool) ($data['is_active'] ?? true),
                'created_by' => $user->id,
                'published_at' => $status === QuestionStatus::Published ? now() : null,
            ]);

            $correctLetter = strtoupper(trim((string) ($data['correct_option'] ?? '')));
            $correctOptionId = null;

            if (isset($data['options']) && is_array($data['options'])) {
                foreach ($data['options'] as $opt) {
                    $letter = strtoupper(trim((string) $opt['letter']));
                    $text = trim((string) $opt['text']);

                    $option = Option::create([
                        'question_id' => $question->id,
                        'letter' => $letter,
                        'text' => $text,
                    ]);

                    if ($letter === $correctLetter) {
                        $correctOptionId = $option->id;
                    }
                }
            }

            if ($correctOptionId !== null) {
                $question->updateQuietly(['correct_option_id' => $correctOptionId]);
            }

            return $question->load(['discipline', 'topic', 'institution', 'options']);
        });
    }
}
