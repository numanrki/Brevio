<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckApiScope
{
    public function handle(Request $request, Closure $next, string ...$scopes): Response
    {
        $bearer = $request->bearerToken();
        if (!$bearer) {
            return response()->json(['message' => 'API key required.'], 401);
        }

        $hashedKey = hash('sha256', $bearer);
        $apiKey = ApiKey::where('key', $hashedKey)->first();

        if (!$apiKey) {
            return response()->json(['message' => 'Invalid API key.'], 401);
        }

        if ($apiKey->expires_at && $apiKey->expires_at->isPast()) {
            return response()->json(['message' => 'API key has expired.'], 401);
        }

        foreach ($scopes as $scope) {
            if (!$apiKey->hasScope($scope)) {
                return response()->json([
                    'message' => "Missing required scope: {$scope}",
                ], 403);
            }
        }

        // Update last used timestamp (throttled to once per minute)
        if (!$apiKey->last_used_at || $apiKey->last_used_at->diffInMinutes(now()) >= 1) {
            $apiKey->update(['last_used_at' => now()]);
        }

        // Attach the API key and its owner to the request
        $request->merge(['api_key' => $apiKey]);
        auth()->login($apiKey->user);

        return $next($request);
    }
}
