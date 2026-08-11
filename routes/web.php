<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UploadController;

Route::inertia('/', 'LandingPage')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post("/imageToJson/upload", [UploadController::class, 'storeMultiple']);

require __DIR__ . '/settings.php';
