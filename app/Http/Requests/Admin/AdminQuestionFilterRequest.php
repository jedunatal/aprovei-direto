<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\Difficulty;
use App\Enums\QuestionStatus;
use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminQuestionFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Question::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'discipline_id' => ['nullable', 'integer', 'exists:disciplines,id'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'institution_id' => ['nullable', 'integer', 'exists:institutions,id'],
            'year' => ['nullable', 'integer', 'min:1970', 'max:2099'],
            'difficulty' => ['nullable', Rule::enum(Difficulty::class)],
            'status' => ['nullable', Rule::enum(QuestionStatus::class)],
            'is_active' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
