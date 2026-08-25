<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\Difficulty;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'discipline_id',
        'topic_id',
        'institution_id',
        'year',
        'statement',
        'explanation',
        'difficulty',
        'correct_option_id',
        'metadata',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'difficulty' => Difficulty::class,
            'metadata' => 'array',
            'is_active' => 'boolean',
        ];
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
}
