<?php

declare(strict_types=1);

namespace App\Actions\Question;

use App\Enums\QuestionStatus;
use App\Models\Question;
use App\Models\User;

class PublishQuestionAction
{
    public function execute(Question $question, User $reviewer, QuestionStatus $newStatus): Question
    {
        $publishedAt = $newStatus === QuestionStatus::Published ? ($question->published_at ?? now()) : null;

        $question->update([
            'status' => $newStatus,
            'reviewed_by' => $reviewer->id,
            'published_at' => $publishedAt,
        ]);

        return $question->fresh(['discipline', 'topic', 'institution', 'options', 'createdBy', 'reviewedBy']);
    }
}
