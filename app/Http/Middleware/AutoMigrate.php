<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AutoMigrate
{
    /**
     * Safety net: if an update_pending flag exists, try to run migrations.
     * This should rarely be needed since performUpdate now runs migrations
     * BEFORE copying new code.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $flag = storage_path('app/update_pending');

        if (!file_exists($flag)) {
            return $next($request);
        }

        // Check retry limit
        $retryFile = storage_path('app/update_migrate_retries');
        $retries = file_exists($retryFile) ? (int) file_get_contents($retryFile) : 0;

        if ($retries >= 3) {
            @unlink($flag);
            @unlink($retryFile);
            return $next($request);
        }

        try {
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }

            \Illuminate\Support\Facades\DB::purge();
            \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
            \Illuminate\Support\Facades\Artisan::call('config:clear');
            \Illuminate\Support\Facades\Artisan::call('cache:clear');

            @unlink($flag);
            @unlink($retryFile);
        } catch (\Throwable $e) {
            file_put_contents($retryFile, (string) ($retries + 1));
            @file_put_contents(storage_path('logs/update-migrate.log'),
                date('Y-m-d H:i:s') . " [AutoMigrate] retry {$retries}: {$e->getMessage()}\n", FILE_APPEND);
        }

        return $next($request);
    }
}
