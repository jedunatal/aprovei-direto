<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Enums\ImportMode;
use App\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ImportQuestionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('import', Question::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:51200', // 50MB
                'mimes:json,ndjson,jsonl,txt',
            ],
            'import_mode' => [
                'nullable',
                Rule::enum(ImportMode::class),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => 'É obrigatório selecionar um arquivo JSON ou NDJSON para importação.',
            'file.max' => 'O arquivo não pode exceder o tamanho máximo de 50MB.',
            'file.mimes' => 'Formato de arquivo inválido. Formatos aceitos: .json, .ndjson, .jsonl, .txt',
        ];
    }
}
