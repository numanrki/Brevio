<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Admin\TwoFactorController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('admin/login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('admin/login', [AuthenticatedSessionController::class, 'store']);

    // Password Reset
    Route::get('admin/forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('admin/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('admin/reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('admin/reset-password', [NewPasswordController::class, 'store'])->name('password.store');

    // 2FA challenge (guest because user is not fully authenticated yet)
    Route::get('admin/2fa', [TwoFactorController::class, 'challenge'])->name('2fa.challenge');
    Route::post('admin/2fa', [TwoFactorController::class, 'verify'])->name('2fa.verify');
});

// Google OAuth — accessible to both guests (login) and authenticated users (profile connect)
Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
