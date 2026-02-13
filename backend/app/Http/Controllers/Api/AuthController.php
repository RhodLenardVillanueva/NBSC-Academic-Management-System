<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/AuthController.php

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends BaseApiController
{
    public function login(LoginRequest $request): Response
    {
        $credentials = $request->validated();

        /** @var User|null $user */
        $user = User::where('email', $credentials['email'])->first();

        if ($user === null || ! Hash::check($credentials['password'], $user->password)) {
            return $this->error('Invalid credentials.', Response::HTTP_UNAUTHORIZED);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->success([
            'token' => $token,
            'tokenType' => 'Bearer',
        ], 'Login successful.');
    }

    public function logout(Request $request): Response
    {
        $user = $request->user();

        if ($user === null || $user->currentAccessToken() === null) {
            return $this->error('Unauthorized.', Response::HTTP_UNAUTHORIZED);
        }

        $user->currentAccessToken()->delete();

        return $this->success(null, 'Logged out.');
    }

    public function whoami(Request $request): Response
    {
        $user = $request->user();

        if ($user === null) {
            return $this->error('Unauthorized.', Response::HTTP_UNAUTHORIZED);
        }

        $user->load('roles');

        return $this->success($user, 'Authenticated user.');
    }
}