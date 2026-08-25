<?php

declare(strict_types=1);

namespace App\Enums;

enum ImportBatchStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendente',
            self::Processing => 'Em Processamento',
            self::Completed => 'Concluído',
            self::Failed => 'Falhou',
            self::Cancelled => 'Cancelado',
        };
    }
}
