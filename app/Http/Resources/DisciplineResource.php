<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Discipline;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Discipline
 */
class DisciplineResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'topics' => TopicResource::collection($this->whenLoaded('topics')),
            'questions_count' => $this->whenCounted('questions'),
        ];
    }
}