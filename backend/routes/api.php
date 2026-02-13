<?php

// File: backend/routes/api.php

use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseOfferingController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\EnrollmentSubjectController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TranscriptController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'role:Admin,Registrar'])->group(function () {
    Route::get('auth/whoami', [AuthController::class, 'whoami']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::apiResource('academic-years', AcademicYearController::class);
    Route::apiResource('course-offerings', CourseOfferingController::class);
    Route::get('enrollments/{enrollment}/cor', [EnrollmentController::class, 'cor']);
    Route::apiResource('enrollments', EnrollmentController::class);
    Route::apiResource('enrollment-subjects', EnrollmentSubjectController::class);
    Route::apiResource('programs', ProgramController::class);
    Route::apiResource('semesters', SemesterController::class);
    Route::apiResource('students', StudentController::class);
    Route::get('students/{student}/transcript', [TranscriptController::class, 'show']);
    Route::apiResource('subjects', SubjectController::class);
});
