<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InstitutionResource;
use App\Models\Institution;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InstitutionController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        $institutions = Institution::where('is_active', true)
            ->withCount('questions')
            ->get();

        return InstitutionResource::collection($institutions);
    }
}