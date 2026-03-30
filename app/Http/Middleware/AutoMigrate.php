<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
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

        // Track retry attempts — give up after 10 to avoid perf overhead
        $retryFile = storage_path('app/update_migrate_retries');
        $retries = file_exists($retryFile) ? (int) file_get_contents($retryFile) : 0;

        if ($retries >= 10) {
            @unlink($flag);
            @unlink($retryFile);
            return $next($request);
        }

        try {
            DB::purge();

            if (function_exists('opcache_reset')) {
                opcache_reset();
            }

            Artisan::call('migrate', ['--force' => true]);
            Artisan::call('config:clear');
            Artisan::call('cache:clear');
            Artisan::call('view:clear');
            Artisan::call('route:clear');

            // Success — remove flag and retry counter
            @unlink($flag);
            @unlink($retryFile);
        } catch (\Throwable $e) {
            // Increment retry counter — do NOT remove the flag so we retry next request
            file_put_contents($retryFile, (string) ($retries + 1));
        }

        return $next($request);
    }
}
