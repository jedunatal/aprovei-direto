<?php

declare(strict_types=1);

namespace App\Enums;

enum QuestionStatus: string
{
    case Draft = 'draft';
    case Review = 'review';
    case Approved = 'approved';
    case Published = 'published';
    case Rejected = 'rejected';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Rascunho',
            self::Review => 'Em Revisão',
            self::Approved => 'Aprovada',
            self::Published => 'Publicada',
            self::Rejected => 'Rejeitada',
            self::Archived => 'Arquivada',
        };
    }
}
