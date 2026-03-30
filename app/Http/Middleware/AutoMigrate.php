<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AutoMigrate
{
    /**
     * If an update_pending flag exists, try running migrations once.
     * On success or failure, the flag is removed to prevent infinite loops.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $flag = storage_path('app/update_pending');

        if (!file_exists($flag)) {
            return $next($request);
        }

        // Remove flag immediately to prevent infinite retry loops
        @unlink($flag);
        @unlink(storage_path('app/update_migrate_retries'));

        try {
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }

            \Illuminate\Support\Facades\DB::purge();
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            \Illuminate\Support\Facades\Artisan::call('config:clear');
            \Illuminate\Support\Facades\Artisan::call('cache:clear');
        } catch (\Throwable $e) {
            @file_put_contents(storage_path('logs/update.log'),
                date('Y-m-d H:i:s') . " [AutoMigrate] {$e->getMessage()}\n", FILE_APPEND);
        }

        return $next($request);
    }
}
