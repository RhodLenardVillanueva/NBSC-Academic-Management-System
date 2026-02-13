<?php

// File: backend/routes/api.php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'role:Admin,Registrar'])->group(function () {
    Route::get('auth/whoami', [AuthController::class, 'whoami']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::apiResource('students', StudentController::class);
});
