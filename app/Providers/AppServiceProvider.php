<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Pre-install: no .env or DB yet — force safe config so the framework can boot
        if (!file_exists(storage_path('installed.lock'))) {
            config([
                'session.driver' => 'file',
                'cache.default'  => 'file',
                'queue.default'  => 'sync',
            ]);

            // EncryptCookies needs an app key; generate a temporary one
            if (empty(config('app.key'))) {
                config(['app.key' => 'base64:' . base64_encode(random_bytes(32))]);
            }
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
    }
}
