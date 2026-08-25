<?php

declare(strict_types=1);

namespace App\Actions\Question;

use App\Models\Option;
use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AnswerQuestionAction
{
    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function execute(User $user, Question $question, array $data): array
    {
        $selectedOptionId = (int) $data['selected_option_id'];

        // Garante que a alternativa enviada pertence estritamente a esta questão
        $optionExistsInQuestion = Option::where('id', $selectedOptionId)
            ->where('question_id', $question->id)
            ->exists();

        if (! $optionExistsInQuestion) {
            throw ValidationException::withMessages([
                'selected_option_id' => ['A alternativa informada não pertence a esta questão.'],
            ]);
        }

        $isCorrect = ($selectedOptionId === (int) $question->correct_option_id);
        $answeredAt = now();

        DB::transaction(function () use ($user, $question, $selectedOptionId, $isCorrect, $answeredAt): void {
            QuestionAttempt::create([
                'user_id' => $user->id,
                'question_id' => $question->id,
                'selected_option_id' => $selectedOptionId,
                'is_correct' => $isCorrect,
                'answered_at' => $answeredAt,
            ]);
        });

        return [
            'is_correct' => $isCorrect,
            'selected_option_id' => $selectedOptionId,
            'correct_option_id' => $question->correct_option_id,
            'explanation' => $question->explanation,
            'answered_at' => $answeredAt->toIso8601String(),
        ];
    }
}
