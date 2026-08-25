<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\Difficulty;
use App\Enums\QuestionStatus;
use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Question::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'external_id' => ['nullable', 'string', 'max:100', 'unique:questions,external_id'],
            'discipline_id' => ['nullable', 'integer', 'exists:disciplines,id'],
            'discipline_name' => ['nullable', 'string', 'max:255'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'topic_name' => ['nullable', 'string', 'max:255'],
            'institution_id' => ['nullable', 'integer', 'exists:institutions,id'],
            'institution_name' => ['nullable', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:1970', 'max:2099'],
            'statement' => ['required', 'string', 'min:5'],
            'explanation' => ['required', 'string'],
            'difficulty' => ['required', Rule::enum(Difficulty::class)],
            'status' => ['nullable', Rule::enum(QuestionStatus::class)],
            'options' => ['required', 'array', 'min:2', 'max:5'],
            'options.*.letter' => ['required', 'string', 'max:1'],
            'options.*.text' => ['required', 'string', 'min:1'],
            'correct_option' => ['required', 'string', 'max:1'],
            'metadata' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
