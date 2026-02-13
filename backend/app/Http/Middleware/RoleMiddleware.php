<?php

namespace App\Http\Middleware;

// File: backend/app/Http/Middleware/RoleMiddleware.php

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  array<int, string>  $roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        $roleNames = array_values(array_filter(array_map(
            static fn (string $role): string => trim($role),
            $roles
        ), static fn (string $role): bool => $role !== ''));

        if ($user === null || $roleNames === []) {
            return response()->json(['message' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $hasRole = $user->roles()->whereIn('name', $roleNames)->exists();

        if (! $hasRole) {
            return response()->json(['message' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}