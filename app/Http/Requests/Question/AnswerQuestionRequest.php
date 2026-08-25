<?php

declare(strict_types=1);

namespace App\Http\Requests\Question;

use Illuminate\Foundation\Http\FormRequest;

class AnswerQuestionRequest extends FormRequest
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
            'selected_option_id' => ['required', 'integer', 'exists:options,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'selected_option_id.required' => 'Selecione uma alternativa para responder.',
            'selected_option_id.exists' => 'A alternativa selecionada é inválida.',
        ];
    }
}
