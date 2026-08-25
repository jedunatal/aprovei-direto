<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DisciplineResource;
use App\Models\Discipline;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DisciplineController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $disciplines = Discipline::where('is_active', true)
            ->with(['topics' => fn ($q) => $q->where('is_active', true)])
            ->withCount('questions')
            ->get();

        return DisciplineResource::collection($disciplines);
    }
}
