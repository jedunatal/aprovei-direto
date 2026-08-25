<?php

declare(strict_types=1);

namespace App\Jobs\Question;

use App\Enums\ImportBatchStatus;
use App\Models\QuestionImportBatch;
use App\Services\Question\QuestionImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class ProcessQuestionImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 600;

    public function __construct(
        public QuestionImportBatch $batch,
    ) {
        $this->onQueue('imports');
    }

    public function handle(QuestionImportService $service): void
    {
        // Se a importação foi cancelada antes do início do worker
        if ($this->batch->status === ImportBatchStatus::Cancelled) {
            return;
        }

        $service->processBatch($this->batch);
    }

    public function failed(?Throwable $exception): void
    {
        $this->batch->update([
            'status' => ImportBatchStatus::Failed,
            'error_summary' => $exception ? $exception->getMessage() : 'Falha desconhecida no worker da fila.',
            'completed_at' => now(),
        ]);
    }
}
