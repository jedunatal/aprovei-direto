<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckActiveSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasActiveSubscription()) {
            return response()->json([
                'message' => 'Sua assinatura não está ativa.',
                'code' => 'SUBSCRIPTION_REQUIRED',
            ], 402);
        }

        return $next($request);
    }
}