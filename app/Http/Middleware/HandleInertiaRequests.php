<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // During installation, DB may not exist — avoid querying user
        $user = null;
        try {
            $user = $request->user();
        } catch (\Throwable) {
            // DB not available yet (pre-install)
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'app_version' => config('app.version'),
        ];
    }
}
