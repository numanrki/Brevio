<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AutoMigrate
{
    public function handle(Request $request, Closure $next): Response
    {
        $flag = storage_path('app/update_pending');

        if (!file_exists($flag)) {
            return $next($request);
        }

        $this->runMigrations();

        return $next($request);
    }

    private function runMigrations(): void
    {
        $flag = storage_path('app/update_pending');
        $log = storage_path('logs/update-migrate.log');

        try {
            if (function_exists('opcache_reset')) {
                @opcache_reset();
            }

            // Try Artisan first (the clean way)
            try {
                \Illuminate\Support\Facades\DB::purge();
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                \Illuminate\Support\Facades\Artisan::call('config:clear');
                \Illuminate\Support\Facades\Artisan::call('cache:clear');
                \Illuminate\Support\Facades\Artisan::call('view:clear');
                \Illuminate\Support\Facades\Artisan::call('route:clear');
                @unlink($flag);
                @unlink(storage_path('app/update_migrate_retries'));
                @file_put_contents($log, date('Y-m-d H:i:s') . " [OK] Artisan migrate succeeded\n", FILE_APPEND);
                return;
            } catch (\Throwable $e) {
                @file_put_contents($log, date('Y-m-d H:i:s') . " [WARN] Artisan migrate failed: {$e->getMessage()}\n", FILE_APPEND);
            }

            // Fallback: run migrations directly via PDO
            $this->runMigrationsViaPdo($log);
            @unlink($flag);
            @unlink(storage_path('app/update_migrate_retries'));

        } catch (\Throwable $e) {
            $retryFile = storage_path('app/update_migrate_retries');
            $retries = file_exists($retryFile) ? (int) file_get_contents($retryFile) : 0;
            if ($retries >= 5) {
                @unlink($flag);
                @unlink($retryFile);
                @file_put_contents($log, date('Y-m-d H:i:s') . " [FAIL] Giving up after 5 retries: {$e->getMessage()}\n", FILE_APPEND);
            } else {
                file_put_contents($retryFile, (string) ($retries + 1));
                @file_put_contents($log, date('Y-m-d H:i:s') . " [RETRY {$retries}] {$e->getMessage()}\n", FILE_APPEND);
            }
        }
    }

    /**
     * Run pending migrations using direct PDO — no framework dependency.
     */
    private function runMigrationsViaPdo(string $log): void
    {
        $pdo = $this->getPdo();
        if (!$pdo) {
            throw new \RuntimeException('Cannot connect to database for direct migration');
        }

        $prefix = config('database.connections.mysql.prefix', env('DB_PREFIX', ''));
        $migrationsTable = $prefix . 'migrations';

        // Ensure migrations table exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS `{$migrationsTable}` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `migration` VARCHAR(255) NOT NULL,
            `batch` INT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Get already-run migrations
        $stmt = $pdo->query("SELECT `migration` FROM `{$migrationsTable}`");
        $ran = $stmt->fetchAll(\PDO::FETCH_COLUMN) ?: [];

        // Get migration files
        $migrationPath = base_path('database/migrations');
        if (!is_dir($migrationPath)) return;

        $files = glob($migrationPath . '/*.php');
        sort($files);

        // Get next batch number
        $batchStmt = $pdo->query("SELECT MAX(`batch`) FROM `{$migrationsTable}`");
        $batch = ((int) $batchStmt->fetchColumn()) + 1;

        $migrated = 0;
        foreach ($files as $file) {
            $name = pathinfo($file, PATHINFO_FILENAME);
            if (in_array($name, $ran)) continue;

            try {
                $migration = require $file;
                if (is_object($migration) && method_exists($migration, 'up')) {
                    $migration->up();
                }
                $safeName = $pdo->quote($name);
                $pdo->exec("INSERT INTO `{$migrationsTable}` (`migration`, `batch`) VALUES ({$safeName}, {$batch})");
                $migrated++;
                @file_put_contents($log, date('Y-m-d H:i:s') . " [PDO] Migrated: {$name}\n", FILE_APPEND);
            } catch (\Throwable $e) {
                @file_put_contents($log, date('Y-m-d H:i:s') . " [PDO-ERR] {$name}: {$e->getMessage()}\n", FILE_APPEND);
                // Continue with remaining migrations
            }
        }

        @file_put_contents($log, date('Y-m-d H:i:s') . " [PDO] Done — ran {$migrated} migrations\n", FILE_APPEND);
    }

    private function getPdo(): ?\PDO
    {
        // Try from Laravel config
        try {
            $host = config('database.connections.mysql.host', '127.0.0.1');
            $port = config('database.connections.mysql.port', 3306);
            $db   = config('database.connections.mysql.database');
            $user = config('database.connections.mysql.username');
            $pass = config('database.connections.mysql.password', '');

            if ($db && $user) {
                return new \PDO(
                    "mysql:host={$host};port={$port};dbname={$db}",
                    $user, $pass,
                    [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION, \PDO::ATTR_TIMEOUT => 10]
                );
            }
        } catch (\Throwable) {}

        // Try from .env file directly
        try {
            $env = @file_get_contents(base_path('.env'));
            if ($env) {
                $get = fn(string $key, string $default = '') => preg_match('/^' . preg_quote($key) . '=(.*)$/m', $env, $m) ? trim($m[1], '"\' ') : $default;
                return new \PDO(
                    "mysql:host={$get('DB_HOST', '127.0.0.1')};port={$get('DB_PORT', '3306')};dbname={$get('DB_DATABASE')}",
                    $get('DB_USERNAME'), $get('DB_PASSWORD', ''),
                    [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION, \PDO::ATTR_TIMEOUT => 10]
                );
            }
        } catch (\Throwable) {}

        return null;
    }
}
