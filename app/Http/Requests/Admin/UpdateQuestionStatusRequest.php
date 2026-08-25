<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\QuestionStatus;
use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateQuestionStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('publish', Question::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(QuestionStatus::class)],
        ];
    }
}
