<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\TwoFactorController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('admin/login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('admin/login', [AuthenticatedSessionController::class, 'store']);

    // 2FA challenge (guest because user is not fully authenticated yet)
    Route::get('admin/2fa', [TwoFactorController::class, 'challenge'])->name('2fa.challenge');
    Route::post('admin/2fa', [TwoFactorController::class, 'verify'])->name('2fa.verify');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
