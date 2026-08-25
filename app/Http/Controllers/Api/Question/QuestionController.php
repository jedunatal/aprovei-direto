<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Question;

use App\Actions\Question\AnswerQuestionAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Question\AnswerQuestionRequest;
use App\Http\Requests\Question\QuestionFilterRequest;
use App\Http\Resources\QuestionAnswerResource;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Models\QuestionAttempt;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    public function index(QuestionFilterRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $query = Question::query()
            ->where('is_active', true)
            ->with(['discipline', 'topic', 'institution', 'options'])
            ->with(['latestUserAttempt' => fn ($q) => $q->where('user_id', $user->id)]);

        // Filtros estruturados
        $query->when($request->filled('discipline_id'), fn (Builder $q) => $q->where('discipline_id', $request->validated('discipline_id')));
        $query->when($request->filled('topic_id'), fn (Builder $q) => $q->where('topic_id', $request->validated('topic_id')));
        $query->when($request->filled('institution_id'), fn (Builder $q) => $q->where('institution_id', $request->validated('institution_id')));
        $query->when($request->filled('year'), fn (Builder $q) => $q->where('year', $request->validated('year')));
        $query->when($request->filled('difficulty'), fn (Builder $q) => $q->where('difficulty', $request->validated('difficulty')));

        // Filtro: Questões não respondidas
        if ($request->boolean('unanswered')) {
            $query->whereDoesntHave('attempts', fn (Builder $q) => $q->where('user_id', $user->id));
        }

        $perPage = (int) ($request->validated('per_page') ?? 15);
        $questions = $query->latest('id')->paginate($perPage);

        return QuestionResource::collection($questions);
    }

    public function show(Question $question): QuestionResource
    {
        $userId = auth()->id();

        $question->load([
            'discipline',
            'topic',
            'institution',
            'options',
            'latestUserAttempt' => fn ($q) => $q->where('user_id', $userId),
        ]);

        return new QuestionResource($question);
    }

    public function answer(
        AnswerQuestionRequest $request,
        Question $question,
        AnswerQuestionAction $action
    ): QuestionAnswerResource {
        $result = $action->execute(
            user: $request->user(),
            question: $question,
            data: $request->validated()
        );

        return new QuestionAnswerResource($result);
    }

    public function errors(QuestionFilterRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();

        // Subquery com ROW_NUMBER para capturar a ÚLTIMA tentativa do aluno por questão
        $latestAttemptsSub = QuestionAttempt::select(
            'question_id',
            'is_correct',
            DB::raw('ROW_NUMBER() OVER (PARTITION BY question_id ORDER BY id DESC) as attempt_rank')
        )->where('user_id', $user->id);

        $incorrectQuestionIds = DB::query()
            ->fromSub($latestAttemptsSub, 'ranked_attempts')
            ->where('attempt_rank', 1)
            ->where('is_correct', false)
            ->pluck('question_id');

        $query = Question::query()
            ->whereIn('id', $incorrectQuestionIds)
            ->where('is_active', true)
            ->with(['discipline', 'topic', 'institution', 'options'])
            ->with(['latestUserAttempt' => fn ($q) => $q->where('user_id', $user->id)]);

        $perPage = (int) ($request->validated('per_page') ?? 15);
        $questions = $query->latest('id')->paginate($perPage);

        return QuestionResource::collection($questions);
    }
}
