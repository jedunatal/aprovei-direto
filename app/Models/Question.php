<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\Difficulty;
use App\Enums\QuestionStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'external_id',
        'discipline_id',
        'topic_id',
        'institution_id',
        'year',
        'statement',
        'explanation',
        'difficulty',
        'status',
        'correct_option_id',
        'metadata',
        'is_active',
        'created_by',
        'reviewed_by',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'difficulty' => Difficulty::class,
            'status' => QuestionStatus::class,
            'metadata' => 'array',
            'is_active' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', QuestionStatus::Published)
            ->where('is_active', true);
    }

    public function scopeForReview(Builder $query): Builder
    {
        return $query->where('status', QuestionStatus::Review);
    }

    public function discipline(): BelongsTo
    {
        return $this->belongsTo(Discipline::class);
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    public function institution(): BelongsTo
    {
        return $this->belongsTo(Institution::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(Option::class)->orderBy('letter');
    }

    public function correctOption(): BelongsTo
    {
        return $this->belongsTo(Option::class, 'correct_option_id');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuestionAttempt::class);
    }

    public function latestUserAttempt(): HasOne
    {
        return $this->hasOne(QuestionAttempt::class)->latestOfMany('answered_at');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
