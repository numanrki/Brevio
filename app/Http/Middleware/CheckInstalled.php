<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckInstalled
{
    /**
     * Redirect non-install routes to /install if not installed.
     * Redirect /install routes elsewhere if already installed.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $installed = file_exists(storage_path('installed.lock'));
        $isInstallRoute = $request->is('install') || $request->is('install/*');

        // Not installed yet — force all non-install routes to /install
        if (!$installed && !$isInstallRoute) {
            // Allow Vite/asset requests through (they don't need install check)
            if ($request->is('build/*') || $request->is('_debugbar/*')) {
                return $next($request);
            }

            return redirect('/install');
        }

        // Already installed — permanently block install routes
        if ($installed && $isInstallRoute) {
            return redirect('/admin/login');
        }

        return $next($request);
    }
}
