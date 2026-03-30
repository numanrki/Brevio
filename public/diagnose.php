<?php
/**
 * Standalone diagnostic — bypasses Laravel entirely.
 * Access: /diagnose.php?key=brevio-debug-2026
 * DELETE THIS FILE after debugging.
 */

$key = $_GET['key'] ?? '';
if ($key !== 'brevio-debug-2026') {
    http_response_code(404);
    exit('Not found');
}

$basePath = dirname(__DIR__);
header('Content-Type: text/plain; charset=utf-8');

echo "=== Brevio Diagnostic ===\n\n";

// PHP info
echo "PHP Version: " . phpversion() . "\n";
echo "Server: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'unknown') . "\n";
echo "OPcache enabled: " . (function_exists('opcache_get_status') && opcache_get_status(false) ? 'YES' : 'NO') . "\n\n";

// App version
$configFile = $basePath . '/config/app.php';
if (file_exists($configFile)) {
    $config = @include $configFile;
    echo "App Version: " . ($config['version'] ?? 'unknown') . "\n\n";
} else {
    echo "config/app.php: MISSING\n\n";
}

// Critical files check
echo "=== Critical Files ===\n";
$criticalFiles = [
    '.env',
    'vendor/autoload.php',
    'bootstrap/app.php',
    'bootstrap/cache/packages.php',
    'bootstrap/cache/services.php',
    'config/app.php',
    'config/database.php',
    'storage/installed.lock',
    'public/build/manifest.json',
];
foreach ($criticalFiles as $f) {
    $full = $basePath . '/' . $f;
    echo (file_exists($full) ? '[OK]' : '[MISSING]') . "  {$f}\n";
}

// Try booting Laravel
echo "\n=== Laravel Boot Test ===\n";
try {
    require $basePath . '/vendor/autoload.php';
    $app = require $basePath . '/bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
    echo "Boot: OK\n";
    echo "Laravel: " . $app->version() . "\n";

    // Test DB connection
    try {
        $pdo = \Illuminate\Support\Facades\DB::connection()->getPdo();
        echo "Database: Connected OK\n";

        // Migration status
        $stmt = $pdo->query("SELECT COUNT(*) FROM migrations");
        echo "Migrations recorded: " . $stmt->fetchColumn() . "\n";
    } catch (\Throwable $e) {
        echo "Database: FAILED — " . $e->getMessage() . "\n";
    }
} catch (\Throwable $e) {
    echo "Boot: FAILED\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nTrace:\n" . $e->getTraceAsString() . "\n";
}

// Last log entries
echo "\n=== Last Laravel Log (50 lines) ===\n";
$logFile = $basePath . '/storage/logs/laravel.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    echo implode('', array_slice($lines, -50));
} else {
    echo "No laravel.log found\n";
}

// Update log
echo "\n\n=== Update Log ===\n";
$updateLog = $basePath . '/storage/logs/update.log';
if (file_exists($updateLog)) {
    echo file_get_contents($updateLog);
} else {
    echo "No update.log found\n";
}
