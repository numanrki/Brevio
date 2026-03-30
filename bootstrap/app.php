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
            // Safety net: if update_pending flag exists and any error occurs,
            // try running migrations to recover
            $flag = storage_path('app/update_pending');
            if (!file_exists($flag)) {
                return null;
            }

            try {
                \Illuminate\Support\Facades\DB::purge();
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                \Illuminate\Support\Facades\Artisan::call('config:clear');
                \Illuminate\Support\Facades\Artisan::call('cache:clear');
                @unlink($flag);
                @unlink(storage_path('app/update_migrate_retries'));
                return redirect($request->fullUrl());
            } catch (\Throwable) {
                @file_put_contents(storage_path('logs/update-migrate.log'),
                    date('Y-m-d H:i:s') . " [ExceptionHandler] Failed to recover: " . $e->getMessage() . "\n", FILE_APPEND);
            }

            return null;
        });
    })->create();
