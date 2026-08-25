<?php

declare(strict_types=1);

namespace App\Http\Requests\Question;

use Illuminate\Foundation\Http\FormRequest;

class QuestionFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'discipline_id' => ['nullable', 'integer', 'exists:disciplines,id'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'institution_id' => ['nullable', 'integer', 'exists:institutions,id'],
            'year' => ['nullable', 'integer', 'min:2000', 'max:2030'],
            'difficulty' => ['nullable', 'string', 'in:easy,medium,hard'],
            'unanswered' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}
