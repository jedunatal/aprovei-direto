<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ImportBatchStatus;
use App\Enums\ImportMode;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionImportBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'file_name',
        'file_path',
        'file_size',
        'import_mode',
        'status',
        'total_records',
        'processed_records',
        'successful_records',
        'failed_records',
        'error_summary',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'import_mode' => ImportMode::class,
            'status' => ImportBatchStatus::class,
            'total_records' => 'integer',
            'processed_records' => 'integer',
            'successful_records' => 'integer',
            'failed_records' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function errors(): HasMany
    {
        return $this->hasMany(QuestionImportError::class, 'import_batch_id');
    }
}
