<?php

declare(strict_types=1);

namespace App\Services\Question;

use App\Actions\Question\BulkUpsertQuestionsAction;
use App\DTOs\Question\QuestionImportItemData;
use App\Enums\ImportBatchStatus;
use App\Models\QuestionImportBatch;
use App\Models\QuestionImportError;
use Illuminate\Support\Facades\Storage;
use Throwable;

class QuestionImportService
{
    public function __construct(
        protected BulkUpsertQuestionsAction $upsertAction,
    ) {}

    public function processBatch(QuestionImportBatch $batch, int $chunkSize = 500): void
    {
        $batch->update([
            'status' => ImportBatchStatus::Processing,
            'started_at' => now(),
        ]);

        $filePath = Storage::path($batch->file_path);
        if (! file_exists($filePath)) {
            $batch->update([
                'status' => ImportBatchStatus::Failed,
                'error_summary' => "Arquivo de importação não encontrado em: {$batch->file_path}",
                'completed_at' => now(),
            ]);

            return;
        }

        try {
            $extension = strtolower(pathinfo($batch->file_name, PATHINFO_EXTENSION));

            if ($extension === 'ndjson' || $extension === 'jsonl') {
                $this->processNdjsonFile($batch, $filePath, $chunkSize);
            } else {
                $this->processJsonArrayFile($batch, $filePath, $chunkSize);
            }

            $batch->refresh();
            $batch->update([
                'status' => ImportBatchStatus::Completed,
                'completed_at' => now(),
            ]);
        } catch (Throwable $e) {
            $batch->update([
                'status' => ImportBatchStatus::Failed,
                'error_summary' => "Erro durante a importação: {$e->getMessage()}",
                'completed_at' => now(),
            ]);
        }
    }

    protected function processNdjsonFile(QuestionImportBatch $batch, string $filePath, int $chunkSize): void
    {
        $handle = fopen($filePath, 'r');
        if (! $handle) {
            throw new \RuntimeException('Não foi possível abrir o arquivo para leitura.');
        }

        $lineNumber = 0;
        $chunk = [];
        $processedCount = 0;
        $successCount = 0;
        $failedCount = 0;

        while (($line = fgets($handle)) !== false) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            $lineNumber++;
            $processedCount++;

            $decoded = json_decode($line, true);
            if (! is_array($decoded)) {
                $failedCount++;
                QuestionImportError::create([
                    'import_batch_id' => $batch->id,
                    'line_number' => $lineNumber,
                    'external_id' => null,
                    'payload' => ['raw_line' => $line],
                    'error_message' => 'Linha não contém um JSON válido.',
                ]);

                continue;
            }

            $validationError = $this->validateRawItem($decoded);
            if ($validationError !== null) {
                $failedCount++;
                QuestionImportError::create([
                    'import_batch_id' => $batch->id,
                    'line_number' => $lineNumber,
                    'external_id' => $decoded['external_id'] ?? null,
                    'payload' => $decoded,
                    'error_message' => $validationError,
                ]);

                continue;
            }

            $chunk[] = QuestionImportItemData::fromArray($decoded);

            if (count($chunk) >= $chunkSize) {
                $results = $this->upsertAction->execute($chunk, $batch->import_mode, $batch->user_id);
                $successCount += ($results['created'] + $results['updated'] + $results['skipped']);
                $chunk = [];

                $batch->update([
                    'processed_records' => $processedCount,
                    'successful_records' => $successCount,
                    'failed_records' => $failedCount,
                ]);
            }
        }

        fclose($handle);

        if (! empty($chunk)) {
            $results = $this->upsertAction->execute($chunk, $batch->import_mode, $batch->user_id);
            $successCount += ($results['created'] + $results['updated'] + $results['skipped']);
        }

        $batch->update([
            'total_records' => $processedCount,
            'processed_records' => $processedCount,
            'successful_records' => $successCount,
            'failed_records' => $failedCount,
        ]);
    }

    protected function processJsonArrayFile(QuestionImportBatch $batch, string $filePath, int $chunkSize): void
    {
        $content = file_get_contents($filePath);
        if ($content === false) {
            throw new \RuntimeException('Não foi possível ler o arquivo JSON.');
        }

        $items = json_decode($content, true);
        if (! is_array($items)) {
            throw new \RuntimeException('O arquivo não contém uma lista JSON válida de questões.');
        }

        $total = count($items);
        $batch->update(['total_records' => $total]);

        $chunk = [];
        $processedCount = 0;
        $successCount = 0;
        $failedCount = 0;

        foreach ($items as $index => $rawItem) {
            $lineNumber = $index + 1;
            $processedCount++;

            if (! is_array($rawItem)) {
                $failedCount++;
                QuestionImportError::create([
                    'import_batch_id' => $batch->id,
                    'line_number' => $lineNumber,
                    'external_id' => null,
                    'payload' => ['item' => $rawItem],
                    'error_message' => 'Item não é um objeto válido.',
                ]);

                continue;
            }

            $validationError = $this->validateRawItem($rawItem);
            if ($validationError !== null) {
                $failedCount++;
                QuestionImportError::create([
                    'import_batch_id' => $batch->id,
                    'line_number' => $lineNumber,
                    'external_id' => $rawItem['external_id'] ?? null,
                    'payload' => $rawItem,
                    'error_message' => $validationError,
                ]);

                continue;
            }

            $chunk[] = QuestionImportItemData::fromArray($rawItem);

            if (count($chunk) >= $chunkSize) {
                $results = $this->upsertAction->execute($chunk, $batch->import_mode, $batch->user_id);
                $successCount += ($results['created'] + $results['updated'] + $results['skipped']);
                $chunk = [];

                $batch->update([
                    'processed_records' => $processedCount,
                    'successful_records' => $successCount,
                    'failed_records' => $failedCount,
                ]);
            }
        }

        if (! empty($chunk)) {
            $results = $this->upsertAction->execute($chunk, $batch->import_mode, $batch->user_id);
            $successCount += ($results['created'] + $results['updated'] + $results['skipped']);
        }

        $batch->update([
            'processed_records' => $processedCount,
            'successful_records' => $successCount,
            'failed_records' => $failedCount,
        ]);
    }

    /**
     * @param  array<string, mixed>  $item
     */
    protected function validateRawItem(array $item): ?string
    {
        $statement = trim((string) ($item['statement'] ?? $item['enunciado'] ?? ''));
        if ($statement === '') {
            return 'O enunciado da questão é obrigatório.';
        }

        $options = $item['options'] ?? $item['alternativas'] ?? [];
        if (! is_array($options) || count($options) < 2) {
            return 'A questão deve conter pelo menos 2 alternativas com letras e textos válidos.';
        }

        $letters = [];
        foreach ($options as $opt) {
            if (! is_array($opt) || ! isset($opt['letter'], $opt['text']) || trim((string) $opt['text']) === '') {
                return 'Todas as alternativas devem conter os campos "letter" e "text" preenchidos.';
            }
            $letters[] = strtoupper(trim((string) $opt['letter']));
        }

        $correct = strtoupper(trim((string) ($item['correct_option'] ?? $item['gabarito'] ?? '')));
        if ($correct === '' || ! in_array($correct, $letters, true)) {
            return "O gabarito ('{$correct}') não corresponde a nenhuma das alternativas informadas (".implode(', ', $letters).').';
        }

        return null;
    }
}
