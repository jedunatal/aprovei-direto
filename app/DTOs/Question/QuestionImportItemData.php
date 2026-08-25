<?php

declare(strict_types=1);

namespace App\DTOs\Question;

use App\Enums\Difficulty;
use App\Enums\QuestionStatus;

readonly class QuestionImportItemData
{
    /**
     * @param  array<int, array{letter: string, text: string}>  $options
     * @param  array<string, mixed>|null  $metadata
     */
    public function __construct(
        public ?string $externalId,
        public string $disciplineName,
        public string $topicName,
        public string $institutionName,
        public int $year,
        public Difficulty $difficulty,
        public string $statement,
        public string $explanation,
        public array $options,
        public string $correctOptionLetter,
        public QuestionStatus $status = QuestionStatus::Published,
        public ?array $metadata = null,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        $rawDifficulty = strtolower((string) ($data['difficulty'] ?? 'medium'));
        $difficulty = match ($rawDifficulty) {
            'easy', 'facil', 'fácil' => Difficulty::Easy,
            'hard', 'dificil', 'difícil' => Difficulty::Hard,
            default => Difficulty::Medium,
        };

        $rawStatus = strtolower((string) ($data['status'] ?? 'published'));
        $status = match ($rawStatus) {
            'draft', 'rascunho' => QuestionStatus::Draft,
            'review', 'revisao', 'revisão' => QuestionStatus::Review,
            'approved', 'aprovada' => QuestionStatus::Approved,
            'rejected', 'rejeitada' => QuestionStatus::Rejected,
            'archived', 'arquivada' => QuestionStatus::Archived,
            default => QuestionStatus::Published,
        };

        $rawOptions = $data['options'] ?? [];
        $options = [];
        foreach ($rawOptions as $opt) {
            if (isset($opt['letter'], $opt['text'])) {
                $options[] = [
                    'letter' => strtoupper(trim((string) $opt['letter'])),
                    'text' => trim((string) $opt['text']),
                ];
            }
        }

        return new self(
            externalId: isset($data['external_id']) && trim((string) $data['external_id']) !== ''
                ? trim((string) $data['external_id'])
                : null,
            disciplineName: trim((string) ($data['discipline'] ?? $data['discipline_name'] ?? '')),
            topicName: trim((string) ($data['topic'] ?? $data['topic_name'] ?? '')),
            institutionName: trim((string) ($data['institution'] ?? $data['institution_name'] ?? $data['banca'] ?? '')),
            year: (int) ($data['year'] ?? $data['ano'] ?? date('Y')),
            difficulty: $difficulty,
            statement: trim((string) ($data['statement'] ?? $data['enunciado'] ?? '')),
            explanation: trim((string) ($data['explanation'] ?? $data['comentario'] ?? $data['explicacao'] ?? '')),
            options: $options,
            correctOptionLetter: strtoupper(trim((string) ($data['correct_option'] ?? $data['gabarito'] ?? ''))),
            status: $status,
            metadata: isset($data['metadata']) && is_array($data['metadata']) ? $data['metadata'] : null,
        );
    }
}
