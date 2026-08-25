<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\Difficulty;
use App\Enums\QuestionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $question = $this->route('question');

        return $question && ($this->user()?->can('update', $question) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'discipline_id' => ['nullable', 'integer', 'exists:disciplines,id'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'institution_id' => ['nullable', 'integer', 'exists:institutions,id'],
            'year' => ['nullable', 'integer', 'min:1970', 'max:2099'],
            'statement' => ['nullable', 'string', 'min:5'],
            'explanation' => ['nullable', 'string'],
            'difficulty' => ['nullable', Rule::enum(Difficulty::class)],
            'status' => ['nullable', Rule::enum(QuestionStatus::class)],
            'options' => ['nullable', 'array', 'min:2', 'max:5'],
            'options.*.letter' => ['required_with:options', 'string', 'max:1'],
            'options.*.text' => ['required_with:options', 'string', 'min:1'],
            'correct_option' => ['nullable', 'string', 'max:1'],
            'metadata' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
