<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

class HealthCheckController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $databaseStatus = 'ok';
        $redisStatus = 'ok';

        try {
            DB::connection()->getPdo();
        } catch (Throwable $e) {
            $databaseStatus = 'error: '.$e->getMessage();
        }

        try {
            Redis::connection()->ping();
        } catch (Throwable $e) {
            $redisStatus = 'error: '.$e->getMessage();
        }

        $isHealthy = $databaseStatus === 'ok' && $redisStatus === 'ok';

        return response()->json([
            'status' => $isHealthy ? 'ok' : 'degraded',
            'application' => config('app.name'),
            'environment' => config('app.env'),
            'checks' => [
                'database' => $databaseStatus,
                'redis' => $redisStatus,
            ],
            'timestamp' => now()->toISOString(),
        ], $isHealthy ? 200 : 503);
    }
}
