<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Question
 */
class QuestionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'year' => $this->year,
            'difficulty' => $this->difficulty->value,
            'statement' => $this->statement,
            'metadata' => $this->metadata,
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
            'last_attempt' => $this->whenLoaded('latestUserAttempt', function () {
                if (! $this->latestUserAttempt) {
                    return null;
                }

                return [
                    'selected_option_id' => $this->latestUserAttempt->selected_option_id,
                    'is_correct' => $this->latestUserAttempt->is_correct,
                    'answered_at' => $this->latestUserAttempt->answered_at->toIso8601String(),
                ];
            }),
        ];
    }
}