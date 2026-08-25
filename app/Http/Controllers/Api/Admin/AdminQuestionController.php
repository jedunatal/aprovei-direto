<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Actions\Question\CreateQuestionAction;
use App\Actions\Question\PublishQuestionAction;
use App\Actions\Question\UpdateQuestionAction;
use App\Enums\QuestionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminQuestionFilterRequest;
use App\Http\Requests\Admin\StoreQuestionRequest;
use App\Http\Requests\Admin\UpdateQuestionRequest;
use App\Http\Requests\Admin\UpdateQuestionStatusRequest;
use App\Http\Resources\Admin\AdminQuestionResource;
use App\Models\Question;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class AdminQuestionController extends Controller
{
    public function index(AdminQuestionFilterRequest $request): AnonymousResourceCollection
    {
        $query = Question::query()
            ->with(['discipline', 'topic', 'institution', 'options', 'correctOption', 'createdBy', 'reviewedBy']);

        // Filtro por texto / busca no enunciado
        $query->when($request->filled('search'), function (Builder $q) use ($request) {
            $term = $request->validated('search');
            $q->where(function (Builder $sub) use ($term) {
                $sub->where('statement', 'like', "%{$term}%")
                    ->orWhere('external_id', 'like', "%{$term}%");
            });
        });

        // Filtros estruturados
        $query->when($request->filled('discipline_id'), fn (Builder $q) => $q->where('discipline_id', $request->validated('discipline_id')));
        $query->when($request->filled('topic_id'), fn (Builder $q) => $q->where('topic_id', $request->validated('topic_id')));
        $query->when($request->filled('institution_id'), fn (Builder $q) => $q->where('institution_id', $request->validated('institution_id')));
        $query->when($request->filled('year'), fn (Builder $q) => $q->where('year', $request->validated('year')));
        $query->when($request->filled('difficulty'), fn (Builder $q) => $q->where('difficulty', $request->validated('difficulty')));
        $query->when($request->filled('status'), fn (Builder $q) => $q->where('status', $request->validated('status')));
        $query->when($request->filled('is_active'), fn (Builder $q) => $q->where('is_active', $request->validated('is_active')));

        $perPage = (int) ($request->validated('per_page') ?? 20);
        $questions = $query->latest('id')->paginate($perPage);

        return AdminQuestionResource::collection($questions);
    }

    public function store(StoreQuestionRequest $request, CreateQuestionAction $action): JsonResponse
    {
        $question = $action->execute(
            user: $request->user(),
            data: $request->validated()
        );

        return (new AdminQuestionResource($question))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Question $question): AdminQuestionResource
    {
        $this->authorize('view', $question);

        $question->load(['discipline', 'topic', 'institution', 'options', 'correctOption', 'createdBy', 'reviewedBy']);

        return new AdminQuestionResource($question);
    }

    public function update(UpdateQuestionRequest $request, Question $question, UpdateQuestionAction $action): AdminQuestionResource
    {
        $updated = $action->execute(
            question: $question,
            user: $request->user(),
            data: $request->validated()
        );

        return new AdminQuestionResource($updated);
    }

    public function destroy(Question $question): JsonResponse
    {
        $this->authorize('delete', $question);

        $question->delete();

        return response()->json([
            'message' => 'Questão removida com sucesso.',
        ]);
    }

    public function updateStatus(UpdateQuestionStatusRequest $request, Question $question, PublishQuestionAction $action): AdminQuestionResource
    {
        $newStatus = QuestionStatus::from((string) $request->validated('status'));

        $updated = $action->execute(
            question: $question,
            reviewer: $request->user(),
            newStatus: $newStatus
        );

        return new AdminQuestionResource($updated);
    }
}
