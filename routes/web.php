<?php

use App\Http\Controllers\FieldController;
use App\Http\Controllers\LocalFileController;
use App\Http\Controllers\RemoteUrlController;
use Illuminate\Support\Facades\Route;


Route::inertia('/', 'LandingPage')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post('/imageToJson/local', [LocalFileController::class, 'storeMultiple']);
Route::post('/imageToJson/remote', [RemoteUrlController::class, 'storeMultiple']);
Route::post("/set-fields", [FieldController::class, 'setFields']);

require __DIR__ . '/settings.php';
