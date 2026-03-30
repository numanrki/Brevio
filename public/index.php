<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Self-heal: regenerate bootstrap cache if missing (prevents 500 after update)
$bootstrapCache = __DIR__.'/../bootstrap/cache';
if (!file_exists($bootstrapCache.'/packages.php') || !file_exists($bootstrapCache.'/services.php')) {
    if (!is_dir($bootstrapCache)) {
        @mkdir($bootstrapCache, 0755, true);
    }
    if (!file_exists($bootstrapCache.'/packages.php')) {
        @file_put_contents($bootstrapCache.'/packages.php', "<?php\n\nreturn [];\n");
    }
    if (!file_exists($bootstrapCache.'/services.php')) {
        @file_put_contents($bootstrapCache.'/services.php', "<?php\n\nreturn [\n    'providers' => [],\n    'eager' => [],\n    'deferred' => [],\n    'when' => [],\n];\n");
    }
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
