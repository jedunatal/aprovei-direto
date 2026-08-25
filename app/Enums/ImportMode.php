<?php

declare(strict_types=1);

namespace App\Enums;

enum ImportMode: string
{
    case Skip = 'skip';
    case Update = 'update';
    case Upsert = 'upsert';

    public function label(): string
    {
        return match ($this) {
            self::Skip => 'Ignorar Duplicadas',
            self::Update => 'Atualizar Existentes',
            self::Upsert => 'Inserir ou Atualizar (Upsert)',
        };
    }
}
