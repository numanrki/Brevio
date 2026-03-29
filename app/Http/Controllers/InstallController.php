<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InstallController extends Controller
{
    /**
     * Show the installation wizard page.
     */
    public function show()
    {
        return Inertia::render('Install');
    }

    /**
     * Step 1: Validate all inputs.
     */
    public function validateInputs(Request $request)
    {
        $request->validate([
            'admin_name'     => 'required|string|max:255',
            'admin_email'    => 'required|email|max:255',
            'admin_password' => 'required|string|min:8|confirmed',
            'db_host'        => 'required|string|max:255',
            'db_port'        => 'required|integer|min:1|max:65535',
            'db_database'    => 'required|string|max:255',
            'db_username'    => 'required|string|max:255',
            'db_password'    => 'nullable|string|max:255',
            'db_prefix'      => ['nullable', 'string', 'max:20', 'regex:/^[a-zA-Z_][a-zA-Z0-9_]*$/'],
            'app_url'        => 'required|url|max:255',
        ]);

        return response()->json(['success' => true, 'message' => 'Validation passed.']);
    }

    /**
     * Step 2: Test database connection.
     */
    public function testDatabase(Request $request)
    {
        $host     = $request->input('db_host');
        $port     = (int) $request->input('db_port', 3306);
        $database = $request->input('db_database');
        $username = $request->input('db_username');
        $password = $request->input('db_password', '');

        try {
            $dsn = "mysql:host={$host};port={$port}";
            $pdo = new \PDO($dsn, $username, $password, [
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_TIMEOUT => 5,
            ]);

            // Create the database if it doesn't exist
            $safeName = preg_replace('/[^a-zA-Z0-9_]/', '', $database);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$safeName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            // Test connection to the actual database
            $pdo->exec("USE `{$safeName}`");

            return response()->json(['success' => true, 'message' => 'Database connection successful.']);
        } catch (\PDOException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Step 3: Write .env file and run migrations.
     */
    public function migrate(Request $request)
    {
        $host     = $request->input('db_host');
        $port     = (int) $request->input('db_port', 3306);
        $database = $request->input('db_database');
        $username = $request->input('db_username');
        $password = $request->input('db_password', '');
        $prefix   = $request->input('db_prefix', '');
        $appUrl   = $request->input('app_url');

        try {
            // Generate APP_KEY if needed
            $appKey = config('app.key');
            if (empty($appKey) || $appKey === 'base64:') {
                $appKey = 'base64:' . base64_encode(random_bytes(32));
            }

            // Write .env file
            $envContent = $this->buildEnvContent($appKey, $appUrl, $host, $port, $database, $username, $password, $prefix);
            file_put_contents(base_path('.env'), $envContent);

            // Reconfigure database connection at runtime
            config([
                'database.connections.mysql.host'     => $host,
                'database.connections.mysql.port'     => $port,
                'database.connections.mysql.database'  => $database,
                'database.connections.mysql.username'  => $username,
                'database.connections.mysql.password'  => $password,
                'database.connections.mysql.prefix'    => $prefix,
            ]);

            DB::purge('mysql');
            DB::reconnect('mysql');

            // Run migrations
            Artisan::call('migrate', ['--force' => true]);

            return response()->json(['success' => true, 'message' => 'Database tables created successfully.']);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Migration failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Step 4: Create admin account and finalize.
     */
    public function finalize(Request $request)
    {
        $name     = $request->input('admin_name');
        $email    = $request->input('admin_email');
        $password = $request->input('admin_password');

        // Reconfigure DB in case config was lost between requests
        $this->reconfigureDatabase($request);

        try {
            // Create admin user
            $userModel = app('App\Models\User');
            $admin = $userModel::updateOrCreate(
                ['email' => $email],
                [
                    'name'              => $name,
                    'email'             => $email,
                    'password'          => Hash::make($password),
                    'role'              => 'admin',
                    'is_verified'       => true,
                    'email_verified_at' => now(),
                ]
            );

            // Write the lock file
            file_put_contents(storage_path('installed.lock'), json_encode([
                'installed_at' => now()->toIso8601String(),
                'version'      => config('app.version', '2.0.0'),
            ]));

            // Clear caches
            Artisan::call('config:clear');
            Artisan::call('cache:clear');

            return response()->json(['success' => true, 'message' => 'Installation complete!']);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Account creation failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reconfigure the database connection from request data.
     */
    private function reconfigureDatabase(Request $request): void
    {
        config([
            'database.connections.mysql.host'     => $request->input('db_host', '127.0.0.1'),
            'database.connections.mysql.port'     => (int) $request->input('db_port', 3306),
            'database.connections.mysql.database'  => $request->input('db_database'),
            'database.connections.mysql.username'  => $request->input('db_username'),
            'database.connections.mysql.password'  => $request->input('db_password', ''),
            'database.connections.mysql.prefix'    => $request->input('db_prefix', ''),
        ]);

        DB::purge('mysql');
        DB::reconnect('mysql');
    }

    /**
     * Build the .env file content.
     */
    private function buildEnvContent(
        string $appKey,
        string $appUrl,
        string $host,
        int $port,
        string $database,
        string $username,
        string $password,
        string $prefix
    ): string {
        return <<<ENV
APP_NAME=Brevio
APP_ENV=production
APP_KEY={$appKey}
APP_DEBUG=false
APP_URL={$appUrl}

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST={$host}
DB_PORT={$port}
DB_DATABASE={$database}
DB_USERNAME={$username}
DB_PASSWORD={$password}
DB_PREFIX={$prefix}

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync

CACHE_STORE=file

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="\${APP_NAME}"

VITE_APP_NAME="\${APP_NAME}"
ENV;
    }
}
