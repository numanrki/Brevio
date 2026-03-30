<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\Response;

class AutoMigrate
{
    /**
     * If an update was recently applied and migrations are pending,
     * run them automatically before the request hits any controller.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $flag = storage_path('app/update_pending');

        if (!file_exists($flag)) {
            return $next($request);
        }

        try {
            Artisan::call('migrate', ['--force' => true]);
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
            Artisan::call('view:clear');
            Artisan::call('route:clear');
        } catch (\Throwable) {
            // Migration failed — remove flag to prevent infinite retry loop
        }

        @unlink($flag);

        return $next($request);
    }
}
