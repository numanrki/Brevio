<?php

use App\Http\Controllers\BioPageController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RedirectController;
use App\Http\Controllers\User;
use App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| User Dashboard Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/', [User\DashboardController::class, 'index'])->name('index');

    // Links
    Route::resource('links', User\LinkController::class);

    // Bio Pages
    Route::resource('bio', User\BioController::class);

    // QR Codes
    Route::resource('qr-codes', User\QrCodeController::class);

    // Campaigns
    Route::resource('campaigns', User\CampaignController::class);

    // Channels
    Route::resource('channels', User\ChannelController::class);

    // Overlays
    Route::resource('overlays', User\OverlayController::class);

    // Pixels
    Route::resource('pixels', User\PixelController::class);

    // Teams
    Route::resource('teams', User\TeamController::class);

    // Domains
    Route::resource('domains', User\DomainController::class);

    // Statistics
    Route::get('stats', [User\StatsController::class, 'index'])->name('stats');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');
    Route::resource('users', Admin\UserController::class);
    Route::resource('links', Admin\LinkController::class);
    Route::resource('plans', Admin\PlanController::class);
    Route::resource('domains', Admin\DomainController::class);
    Route::resource('pages', Admin\PageController::class);
    Route::resource('reports', Admin\ReportController::class);
    Route::get('settings', [Admin\SettingController::class, 'index'])->name('settings.index');
    Route::post('settings', [Admin\SettingController::class, 'update'])->name('settings.update');
});

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Public Bio Pages
|--------------------------------------------------------------------------
*/
Route::get('/bio/{alias}', [BioPageController::class, 'show'])->name('bio.show');

/*
|--------------------------------------------------------------------------
| Short URL Redirect (must be LAST)
|--------------------------------------------------------------------------
*/
Route::get('/{alias}', [RedirectController::class, 'handle'])->name('redirect')->where('alias', '[a-zA-Z0-9_-]+');
