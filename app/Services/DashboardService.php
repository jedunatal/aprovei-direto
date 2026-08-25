<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function getStats(User $user): array
    {
        return [
            'overview' => $this->getOverviewStats($user),
            'disciplines' => $this->getDisciplineStats($user),
            'daily' => $this->getDailyEvolution($user),
            'errors' => $this->getRecentErrors($user),
        ];
    }

    /**
     * @return array<string, int|float>
     */
    private function getOverviewStats(User $user): array
    {
        $stats = QuestionAttempt::where('user_id', $user->id)
            ->selectRaw('
                COUNT(*) as total_answered,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as total_correct,
                SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as total_incorrect
            ')
            ->first();

        $answered = (int) ($stats->total_answered ?? 0);
        $correct = (int) ($stats->total_correct ?? 0);
        $incorrect = (int) ($stats->total_incorrect ?? 0);
        $accuracy = $answered > 0 ? round(($correct / $answered) * 100, 1) : 0.0;

        return [
            'answered' => $answered,
            'correct' => $correct,
            'incorrect' => $incorrect,
            'accuracy' => $accuracy,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getDisciplineStats(User $user): array
    {
        $results = DB::table('question_attempts')
            ->join('questions', 'question_attempts.question_id', '=', 'questions.id')
            ->join('disciplines', 'questions.discipline_id', '=', 'disciplines.id')
            ->where('question_attempts.user_id', $user->id)
            ->select(
                'disciplines.id',
                'disciplines.name',
                'disciplines.slug',
                DB::raw('COUNT(question_attempts.id) as answered'),
                DB::raw('SUM(CASE WHEN question_attempts.is_correct = 1 THEN 1 ELSE 0 END) as correct'),
                DB::raw('SUM(CASE WHEN question_attempts.is_correct = 0 THEN 1 ELSE 0 END) as incorrect')
            )
            ->groupBy('disciplines.id', 'disciplines.name', 'disciplines.slug')
            ->orderByDesc('answered')
            ->get();

        return $results->map(function ($row): array {
            $answered = (int) $row->answered;
            $correct = (int) $row->correct;
            $incorrect = (int) $row->incorrect;
            $accuracy = $answered > 0 ? round(($correct / $answered) * 100, 1) : 0.0;

            return [
                'id' => $row->id,
                'name' => $row->name,
                'slug' => $row->slug,
                'answered' => $answered,
                'correct' => $correct,
                'incorrect' => $incorrect,
                'accuracy' => $accuracy,
            ];
        })->toArray();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getDailyEvolution(User $user): array
    {
        $results = DB::table('question_attempts')
            ->where('user_id', $user->id)
            ->where('answered_at', '>=', now()->subDays(14)->startOfDay())
            ->select(
                DB::raw('DATE(answered_at) as date'),
                DB::raw('COUNT(*) as answered'),
                DB::raw('SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct'),
                DB::raw('SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as incorrect')
            )
            ->groupBy(DB::raw('DATE(answered_at)'))
            ->orderBy('date', 'asc')
            ->get();

        return $results->map(fn ($row): array => [
            'date' => (string) $row->date,
            'answered' => (int) $row->answered,
            'correct' => (int) $row->correct,
            'incorrect' => (int) $row->incorrect,
        ])->toArray();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getRecentErrors(User $user): array
    {
        $latestAttemptsSub = QuestionAttempt::select(
            'question_id',
            'is_correct',
            DB::raw('ROW_NUMBER() OVER (PARTITION BY question_id ORDER BY id DESC) as attempt_rank')
        )->where('user_id', $user->id);

        $incorrectQuestionIds = DB::query()
            ->fromSub($latestAttemptsSub, 'ranked_attempts')
            ->where('attempt_rank', 1)
            ->where('is_correct', false)
            ->limit(5)
            ->pluck('question_id');

        return Question::whereIn('id', $incorrectQuestionIds)
            ->with(['discipline', 'topic', 'institution'])
            ->get()
            ->map(fn (Question $q): array => [
                'id' => $q->id,
                'statement' => $q->statement,
                'year' => $q->year,
                'difficulty' => $q->difficulty->value,
                'discipline' => $q->discipline->name,
                'topic' => $q->topic->name,
                'institution' => $q->institution->name,
            ])
            ->toArray();
    }
}