<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\QuestionImportBatch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin QuestionImportBatch
 */
class QuestionImportBatchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'file_name' => $this->file_name,
            'file_size' => $this->file_size,
            'import_mode' => $this->import_mode->value,
            'import_mode_label' => $this->import_mode->label(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'total_records' => $this->total_records,
            'processed_records' => $this->processed_records,
            'successful_records' => $this->successful_records,
            'failed_records' => $this->failed_records,
            'progress_percent' => $this->total_records > 0
                ? round(($this->processed_records / $this->total_records) * 100, 1)
                : 0,
            'error_summary' => $this->error_summary,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'started_at' => $this->started_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
