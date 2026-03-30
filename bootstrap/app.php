<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\AutoMigrate::class,
            \App\Http\Middleware\CheckInstalled::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);

        $middleware->redirectGuestsTo('/admin/login');
        $middleware->redirectUsersTo('/admin');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            $flag = storage_path('app/update_pending');
            if (!file_exists($flag)) {
                return null;
            }

            $log = storage_path('logs/update-migrate.log');
            @file_put_contents($log, date('Y-m-d H:i:s') . " [EXCEPTION] " . get_class($e) . ": {$e->getMessage()}\n", FILE_APPEND);

            // Try Artisan
            try {
                \Illuminate\Support\Facades\DB::purge();
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                \Illuminate\Support\Facades\Artisan::call('config:clear');
                \Illuminate\Support\Facades\Artisan::call('cache:clear');
                @unlink($flag);
                @unlink(storage_path('app/update_migrate_retries'));
                @file_put_contents($log, date('Y-m-d H:i:s') . " [EXCEPTION-RECOVERY] Artisan migrate OK\n", FILE_APPEND);
                return redirect($request->fullUrl());
            } catch (\Throwable $artisanErr) {
                @file_put_contents($log, date('Y-m-d H:i:s') . " [EXCEPTION-RECOVERY] Artisan failed: {$artisanErr->getMessage()}\n", FILE_APPEND);
            }

            // Try direct PDO migration
            try {
                $middleware = new \App\Http\Middleware\AutoMigrate();
                $reflection = new \ReflectionMethod($middleware, 'runMigrationsViaPdo');
                $reflection->setAccessible(true);
                $reflection->invoke($middleware, $log);
                @unlink($flag);
                @unlink(storage_path('app/update_migrate_retries'));
                @file_put_contents($log, date('Y-m-d H:i:s') . " [EXCEPTION-RECOVERY] PDO migrate OK\n", FILE_APPEND);
                return redirect($request->fullUrl());
            } catch (\Throwable $pdoErr) {
                @file_put_contents($log, date('Y-m-d H:i:s') . " [EXCEPTION-RECOVERY] PDO failed: {$pdoErr->getMessage()}\n", FILE_APPEND);
            }

            return null;
        });
    })->create();
