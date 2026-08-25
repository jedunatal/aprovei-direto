<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionImportError extends Model
{
    use HasFactory;

    protected $fillable = [
        'import_batch_id',
        'line_number',
        'external_id',
        'payload',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'line_number' => 'integer',
            'payload' => 'array',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(QuestionImportBatch::class, 'import_batch_id');
    }
}
