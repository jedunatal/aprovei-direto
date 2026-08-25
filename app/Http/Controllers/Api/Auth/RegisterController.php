<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Auth;

use App\Enums\Role as AppRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ApiRegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function __invoke(ApiRegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $createdUser = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => Hash::make($request->validated('password')),
            ]);

            // Todo novo usuário registrado recebe a role padrão 'student'
            $createdUser->assignRole(AppRole::Student->value);

            return $createdUser;
        });

        event(new Registered($user));

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Conta criada com sucesso.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ], 201);
    }
}
