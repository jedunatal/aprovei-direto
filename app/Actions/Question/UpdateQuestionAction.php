<?php

declare(strict_types=1);

namespace App\Actions\Question;

use App\Enums\Difficulty;
use App\Enums\QuestionStatus;
use App\Models\Option;
use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateQuestionAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Question $question, User $user, array $data): Question
    {
        return DB::transaction(function () use ($question, $user, $data): Question {
            $status = isset($data['status'])
                ? QuestionStatus::from((string) $data['status'])
                : $question->status;

            $updateData = [
                'statement' => isset($data['statement']) ? trim((string) $data['statement']) : $question->statement,
                'explanation' => isset($data['explanation']) ? trim((string) $data['explanation']) : $question->explanation,
                'status' => $status,
                'reviewed_by' => $user->id,
            ];

            if (isset($data['discipline_id'])) {
                $updateData['discipline_id'] = (int) $data['discipline_id'];
            }
            if (isset($data['topic_id'])) {
                $updateData['topic_id'] = (int) $data['topic_id'];
            }
            if (isset($data['institution_id'])) {
                $updateData['institution_id'] = (int) $data['institution_id'];
            }
            if (isset($data['year'])) {
                $updateData['year'] = (int) $data['year'];
            }
            if (isset($data['difficulty'])) {
                $updateData['difficulty'] = Difficulty::from((string) $data['difficulty']);
            }
            if (isset($data['metadata'])) {
                $updateData['metadata'] = $data['metadata'];
            }
            if (isset($data['is_active'])) {
                $updateData['is_active'] = (bool) $data['is_active'];
            }

            if ($status === QuestionStatus::Published && $question->published_at === null) {
                $updateData['published_at'] = now();
            }

            $question->update($updateData);

            if (isset($data['options']) && is_array($data['options'])) {
                $correctLetter = strtoupper(trim((string) ($data['correct_option'] ?? '')));
                $correctOptionId = null;

                foreach ($data['options'] as $opt) {
                    $letter = strtoupper(trim((string) $opt['letter']));
                    $text = trim((string) $opt['text']);

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

                if ($correctOptionId !== null) {
                    $question->updateQuietly(['correct_option_id' => $correctOptionId]);
                }
            }

            return $question->fresh(['discipline', 'topic', 'institution', 'options', 'createdBy', 'reviewedBy']);
        });
    }
}
