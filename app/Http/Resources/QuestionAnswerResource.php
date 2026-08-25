<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionAnswerResource extends JsonResource
{
    /**
     * Remove o encapsulamento 'data' para retornar o resultado na raiz do payload.
     *
     * @var string|null
     */
    public static $wrap = null;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'is_correct' => $this->resource['is_correct'],
            'selected_option_id' => $this->resource['selected_option_id'],
            'correct_option_id' => $this->resource['correct_option_id'],
            'explanation' => $this->resource['explanation'],
            'answered_at' => $this->resource['answered_at'],
        ];
    }
}