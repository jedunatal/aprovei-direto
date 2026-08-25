<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Models\QuestionImportError;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin QuestionImportError
 */
class QuestionImportErrorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'import_batch_id' => $this->import_batch_id,
            'line_number' => $this->line_number,
            'external_id' => $this->external_id,
            'payload' => $this->payload,
            'error_message' => $this->error_message,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
