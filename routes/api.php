<?php

use App\Http\Controllers\Api\BioController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\LinkAnalyticsController;
use App\Http\Controllers\Api\QrCodeController;
use Illuminate\Support\Facades\Route;

// Legacy Sanctum-based auth (preserved for backward compatibility)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/links/{link}/analytics', [LinkAnalyticsController::class, 'show']);
    Route::apiResource('links', LinkController::class);
    Route::apiResource('qr-codes', QrCodeController::class);
});

// API Key-based auth with scopes
Route::prefix('v1')->group(function () {
    // Public health check (no auth required)
    Route::get('/ping', fn () => response()->json(['status' => 'ok', 'timestamp' => now()->toIso8601String()]));

    // Links
    Route::middleware('api.scope:links:read')->group(function () {
        Route::get('/links', [LinkController::class, 'index']);
        Route::get('/links/{link}', [LinkController::class, 'show']);
        Route::get('/links/{link}/analytics', [LinkAnalyticsController::class, 'show']);
    });
    Route::middleware('api.scope:links:write')->group(function () {
        Route::post('/links', [LinkController::class, 'store']);
        Route::put('/links/{link}', [LinkController::class, 'update']);
        Route::delete('/links/{link}', [LinkController::class, 'destroy']);
    });

    // QR Codes
    Route::middleware('api.scope:qr:read')->group(function () {
        Route::get('/qr-codes', [QrCodeController::class, 'index']);
        Route::get('/qr-codes/{qrCode}', [QrCodeController::class, 'show']);
    });
    Route::middleware('api.scope:qr:write')->group(function () {
        Route::post('/qr-codes', [QrCodeController::class, 'store']);
        Route::put('/qr-codes/{qrCode}', [QrCodeController::class, 'update']);
        Route::delete('/qr-codes/{qrCode}', [QrCodeController::class, 'destroy']);
    });

    // Bio Pages
    Route::middleware('api.scope:bio:read')->group(function () {
        Route::get('/bio', [BioController::class, 'index']);
        Route::get('/bio/{bio}', [BioController::class, 'show']);
    });
    Route::middleware('api.scope:bio:write')->group(function () {
        Route::post('/bio', [BioController::class, 'store']);
        Route::put('/bio/{bio}', [BioController::class, 'update']);
        Route::delete('/bio/{bio}', [BioController::class, 'destroy']);
    });
});
