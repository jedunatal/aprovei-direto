<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Subscription;

use App\Actions\Subscription\CreatePixCheckoutAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Subscription\CheckoutRequest;
use App\Http\Resources\SubscriptionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function checkout(CheckoutRequest $request, CreatePixCheckoutAction $action): JsonResponse
    {
        $pixData = $action->execute(
            user: $request->user(),
            plan: $request->validated('plan')
        );

        return response()->json($pixData->toArray(), 201);
    }

    public function status(Request $request): JsonResponse
    {
        $subscription = $request->user()->subscriptions()->latest('id')->first();

        if (! $subscription) {
            return response()->json([
                'has_subscription' => false,
                'subscription' => null,
            ], 200);
        }

        return response()->json([
            'has_subscription' => true,
            'subscription' => new SubscriptionResource($subscription),
        ], 200);
    }
}
