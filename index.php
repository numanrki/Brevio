<?php

/**
 * Laravel - A PHP Framework For Web Artisans
 *
 * This file allows the application to run from the project root
 * instead of the public/ directory on shared hosting / XAMPP.
 */

$publicPath = __DIR__.'/public';

// Determine the requested path, stripping the subdirectory prefix
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$uri = str_replace('/welink', '', $uri);

// Serve static files from public/ directly with correct MIME types
if ($uri !== '/' && file_exists($publicPath.$uri) && is_file($publicPath.$uri)) {
    $mimeTypes = [
        'css'   => 'text/css',
        'js'    => 'application/javascript',
        'mjs'   => 'application/javascript',
        'json'  => 'application/json',
        'png'   => 'image/png',
        'jpg'   => 'image/jpeg',
        'jpeg'  => 'image/jpeg',
        'gif'   => 'image/gif',
        'svg'   => 'image/svg+xml',
        'ico'   => 'image/x-icon',
        'webp'  => 'image/webp',
        'woff'  => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf'   => 'font/ttf',
        'eot'   => 'application/vnd.ms-fontobject',
        'map'   => 'application/json',
        'txt'   => 'text/plain',
        'xml'   => 'application/xml',
        'webmanifest' => 'application/manifest+json',
    ];

    $ext = strtolower(pathinfo($uri, PATHINFO_EXTENSION));
    $contentType = $mimeTypes[$ext] ?? (mime_content_type($publicPath.$uri) ?: 'application/octet-stream');

    header('Content-Type: ' . $contentType);
    header('Content-Length: ' . filesize($publicPath.$uri));
    header('Cache-Control: public, max-age=31536000, immutable');
    readfile($publicPath.$uri);
    exit;
}

// Otherwise, boot Laravel through the public index.php
$_SERVER['SCRIPT_FILENAME'] = $publicPath.'/index.php';
$_SERVER['SCRIPT_NAME'] = '/welink/index.php';

require_once $publicPath.'/index.php';
