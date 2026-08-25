<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ImportBatchStatus;
use App\Enums\ImportMode;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ImportQuestionsRequest;
use App\Http\Resources\Admin\QuestionImportBatchResource;
use App\Http\Resources\Admin\QuestionImportErrorResource;
use App\Jobs\Question\ProcessQuestionImportJob;
use App\Models\Question;
use App\Models\QuestionImportBatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class QuestionImportController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('import', Question::class);

        $batches = QuestionImportBatch::query()
            ->with('user')
            ->latest('id')
            ->paginate(15);

        return QuestionImportBatchResource::collection($batches);
    }

    public function store(ImportQuestionsRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file('file');

        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $filePath = $file->store('imports');

        $importMode = $request->filled('import_mode')
            ? ImportMode::from((string) $request->input('import_mode'))
            : ImportMode::Skip;

        $batch = QuestionImportBatch::create([
            'user_id' => $user->id,
            'file_name' => $originalName,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'import_mode' => $importMode,
            'status' => ImportBatchStatus::Pending,
        ]);

        ProcessQuestionImportJob::dispatch($batch);

        return (new QuestionImportBatchResource($batch->load('user')))
            ->response()
            ->setStatusCode(Response::HTTP_ACCEPTED);
    }

    public function show(QuestionImportBatch $batch): QuestionImportBatchResource
    {
        $this->authorize('import', Question::class);

        return new QuestionImportBatchResource($batch->load('user'));
    }

    public function errors(QuestionImportBatch $batch): AnonymousResourceCollection
    {
        $this->authorize('import', Question::class);

        $errors = $batch->errors()->latest('id')->paginate(50);

        return QuestionImportErrorResource::collection($errors);
    }

    public function cancel(QuestionImportBatch $batch): JsonResponse
    {
        $this->authorize('import', Question::class);

        if ($batch->status === ImportBatchStatus::Pending) {
            $batch->update([
                'status' => ImportBatchStatus::Cancelled,
                'completed_at' => now(),
            ]);

            return response()->json([
                'message' => 'Importação cancelada com sucesso.',
                'batch' => new QuestionImportBatchResource($batch->load('user')),
            ]);
        }

        return response()->json([
            'message' => 'Não é possível cancelar uma importação que já foi processada ou está em andamento.',
        ], Response::HTTP_UNPROCESSABLE_ENTITY);
    }
}
