<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Option
 */
class OptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // GABARITO NUNCA É EXPOSTO NESTE RESOURCE
        return [
            'id' => $this->id,
            'letter' => $this->letter,
            'text' => $this->text,
        ];
    }
}