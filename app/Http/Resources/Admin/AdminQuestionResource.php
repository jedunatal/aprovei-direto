<?php

declare(strict_types=1);

namespace App\Http\Resources\Admin;

use App\Http\Resources\OptionResource;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Question
 */
class AdminQuestionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'external_id' => $this->external_id,
            'year' => $this->year,
            'difficulty' => $this->difficulty->value,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'statement' => $this->statement,
            'explanation' => $this->explanation,
            'correct_option_id' => $this->correct_option_id,
            'correct_option_letter' => $this->correctOption?->letter,
            'metadata' => $this->metadata,
            'is_active' => $this->is_active,
            'discipline' => [
                'id' => $this->discipline->id,
                'name' => $this->discipline->name,
                'slug' => $this->discipline->slug,
            ],
            'topic' => [
                'id' => $this->topic->id,
                'name' => $this->topic->name,
                'slug' => $this->topic->slug,
            ],
            'institution' => [
                'id' => $this->institution->id,
                'name' => $this->institution->name,
                'slug' => $this->institution->slug,
            ],
            'options' => OptionResource::collection($this->options),
            'created_by' => $this->createdBy ? [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name,
                'email' => $this->createdBy->email,
            ] : null,
            'reviewed_by' => $this->reviewedBy ? [
                'id' => $this->reviewedBy->id,
                'name' => $this->reviewedBy->name,
                'email' => $this->reviewedBy->email,
            ] : null,
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
