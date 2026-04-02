<?php

use App\Http\Controllers\BioPageController;
use App\Http\Controllers\ImageTrackerServeController;
use App\Http\Controllers\InstallController;
use App\Http\Controllers\PixelFireController;
use App\Http\Controllers\QrScanController;
use App\Http\Controllers\RedirectController;
use App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Installation Wizard (only accessible before install)
|--------------------------------------------------------------------------
*/
Route::get('/install', [InstallController::class, 'show'])->name('install');
Route::post('/install/validate', [InstallController::class, 'validateInputs'])->name('install.validate')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
Route::post('/install/database', [InstallController::class, 'testDatabase'])->name('install.database')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
Route::post('/install/migrate', [InstallController::class, 'migrate'])->name('install.migrate')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
Route::post('/install/finalize', [InstallController::class, 'finalize'])->name('install.finalize')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

/*
|--------------------------------------------------------------------------
| Home — redirect to admin
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return redirect()->route('admin.dashboard');
})->name('home');

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');

    // Links
    Route::get('links/{link}/analytics', [Admin\LinkAnalyticsController::class, 'show'])->name('links.analytics');
    Route::post('links/{link}/generate-qr', [Admin\LinkController::class, 'generateQr'])->name('links.generate-qr');
    Route::resource('links', Admin\LinkController::class);

    // Bio Pages
    Route::get('bio/{bio}/analytics', [Admin\BioAnalyticsController::class, 'show'])->name('bio.analytics');
    Route::post('bio/{bio}/generate-qr', [Admin\BioController::class, 'generateQr'])->name('bio.generate-qr');
    Route::post('bio/upload-image', [Admin\BioController::class, 'uploadImage'])->name('bio.upload-image');
    Route::post('bio/upload-avatar', [Admin\BioController::class, 'uploadAvatar'])->name('bio.upload-avatar');
    Route::resource('bio', Admin\BioController::class);

    // QR Codes
    Route::get('qr-codes/{qrCode}/analytics', [Admin\QrAnalyticsController::class, 'show'])->name('qr-codes.analytics');
    Route::resource('qr-codes', Admin\QrCodeController::class);

    // Statistics
    Route::get('stats', [Admin\StatsController::class, 'index'])->name('stats');

    // Domains
    Route::resource('domains', Admin\DomainController::class);

    // Deep Links
    Route::get('deep-links/{deep_link}/analytics', [Admin\DeepLinkController::class, 'analytics'])->name('deep-links.analytics');
    Route::post('deep-links/{deep_link}/generate-qr', [Admin\DeepLinkController::class, 'generateQr'])->name('deep-links.generate-qr');
    Route::resource('deep-links', Admin\DeepLinkController::class);

    // Tracking Pixels
    Route::get('pixels/{pixel}/analytics', [Admin\PixelController::class, 'analytics'])->name('pixels.analytics');
    Route::resource('pixels', Admin\PixelController::class);

    // Image Trackers
    Route::resource('image-trackers', Admin\ImageTrackerController::class)->only(['index', 'create', 'store', 'show', 'destroy']);

    // Pages
    Route::resource('pages', Admin\PageController::class);

    // Reports
    Route::resource('reports', Admin\ReportController::class);

    // Settings
    Route::get('settings', [Admin\SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [Admin\SettingController::class, 'update'])->name('settings.update');
    Route::post('cache-clear', [Admin\SettingController::class, 'clearCache'])->name('cache.clear')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

    // API Keys
    Route::get('api-keys', [Admin\ApiKeyController::class, 'index'])->name('api-keys.index');
    Route::post('api-keys', [Admin\ApiKeyController::class, 'store'])->name('api-keys.store');
    Route::delete('api-keys/{id}', [Admin\ApiKeyController::class, 'destroy'])->name('api-keys.destroy');
    Route::post('api-keys/{id}/regenerate', [Admin\ApiKeyController::class, 'regenerate'])->name('api-keys.regenerate');
    Route::post('api-keys/{id}/toggle', [Admin\ApiKeyController::class, 'toggle'])->name('api-keys.toggle');
    Route::get('api-keys/{id}/reveal', [Admin\ApiKeyController::class, 'reveal'])->name('api-keys.reveal');

    // API Documentation (protected pages)
    Route::get('api-docs/{section}', [Admin\ApiDocsController::class, 'gate'])->name('api-docs.show');
    Route::post('api-docs/verify', [Admin\ApiDocsController::class, 'verify'])->name('api-docs.verify')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

    // Ads & Interstitial
    Route::get('ads', [Admin\AdsController::class, 'index'])->name('ads.index');
    Route::post('ads', [Admin\AdsController::class, 'update'])->name('ads.update');

    // Two-Factor Authentication
    Route::post('2fa/setup', [Admin\TwoFactorController::class, 'setup'])->name('2fa.setup')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    Route::post('2fa/confirm', [Admin\TwoFactorController::class, 'confirm'])->name('2fa.confirm')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    Route::post('2fa/disable', [Admin\TwoFactorController::class, 'disable'])->name('2fa.disable')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    Route::post('2fa/recovery-codes', [Admin\TwoFactorController::class, 'recoveryCodes'])->name('2fa.recovery-codes')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

    // Updates
    Route::get('updates', [Admin\UpdateController::class, 'index'])->name('updates.index');
    Route::post('updates/check-stable', [Admin\UpdateController::class, 'checkStable'])->name('updates.check-stable');
    Route::post('updates/check-beta', [Admin\UpdateController::class, 'checkBeta'])->name('updates.check-beta');
    Route::post('updates/install-stable', [Admin\UpdateController::class, 'installStable'])->name('updates.install-stable')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    Route::post('updates/install-beta', [Admin\UpdateController::class, 'installBeta'])->name('updates.install-beta')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    Route::post('updates/run-migrations', [Admin\UpdateController::class, 'runMigrations'])->name('updates.run-migrations')->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

    // Profile
    Route::get('profile', [Admin\ProfileController::class, 'index'])->name('profile.index');
    Route::post('profile', [Admin\ProfileController::class, 'update'])->name('profile.update');
    Route::post('profile/avatar', [Admin\ProfileController::class, 'uploadAvatar'])->name('profile.avatar');
    Route::delete('profile/avatar', [Admin\ProfileController::class, 'removeAvatar'])->name('profile.avatar.remove');
    Route::post('profile/google-auth', [Admin\ProfileController::class, 'updateGoogleAuth'])->name('profile.google-auth');
    Route::delete('profile/google', [Admin\ProfileController::class, 'disconnectGoogle'])->name('profile.google.disconnect');
});

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Public Bio Pages
|--------------------------------------------------------------------------
*/
Route::get('/bio/{alias}', [BioPageController::class, 'show'])->name('bio.show');
Route::post('/bio/{alias}/track', [BioPageController::class, 'track'])->name('bio.track');

/*
|--------------------------------------------------------------------------
| QR Code Scan Tracking
|--------------------------------------------------------------------------
*/
Route::get('/qr/{id}', [QrScanController::class, 'handle'])->name('qr.scan')->where('id', '[0-9]+');

/*
|--------------------------------------------------------------------------
| Pixel Tracking (public, no auth)
|--------------------------------------------------------------------------
*/
Route::get('/pixel/{token}.gif', [PixelFireController::class, 'image'])->where('token', '[a-zA-Z0-9]{32}');
Route::get('/pixel/{token}.js', [PixelFireController::class, 'script'])->where('token', '[a-zA-Z0-9]{32}');

/*
|--------------------------------------------------------------------------
| Tracked Image Serving (public, no auth)
|--------------------------------------------------------------------------
*/
Route::get('/img/{token}.{ext}', [ImageTrackerServeController::class, 'serve'])->where(['token' => '[a-zA-Z0-9]{32}', 'ext' => 'jpg|jpeg|png|gif|webp']);

/*
|--------------------------------------------------------------------------
| Short URL Redirect (must be LAST)
|--------------------------------------------------------------------------
*/
Route::post('/{alias}/verify-password', [RedirectController::class, 'verifyPassword'])->where('alias', '[a-zA-Z0-9_-]+');
Route::get('/{alias}', [RedirectController::class, 'handle'])->name('redirect')->where('alias', '[a-zA-Z0-9_-]+');
