<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\QrCodeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/account', [AccountController::class, 'show']);
    Route::put('/account', [AccountController::class, 'update']);

    Route::apiResource('links', LinkController::class);
    Route::apiResource('qr-codes', QrCodeController::class);
});
