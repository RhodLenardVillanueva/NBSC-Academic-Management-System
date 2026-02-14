<?php

// File: backend/routes/api.php

use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\AssessmentInstallmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseOfferingController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\EnrollmentSubjectController;
use App\Http\Controllers\Api\InstructorController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TranscriptController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'role:Admin,Registrar,Faculty'])->group(function () {
    Route::get('auth/whoami', [AuthController::class, 'whoami']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('faculty/course-offerings', [CourseOfferingController::class, 'facultyIndex']);
    Route::get('course-offerings/{courseOffering}/students', [CourseOfferingController::class, 'students']);
});

Route::middleware(['auth:sanctum', 'role:Admin,Registrar'])->group(function () {
    Route::apiResource('academic-years', AcademicYearController::class);
    Route::apiResource('course-offerings', CourseOfferingController::class);
    Route::get('enrollments/{enrollment}/assessment', [AssessmentController::class, 'showByEnrollment']);
    Route::post('enrollments/{enrollment}/assessment', [AssessmentController::class, 'storeByEnrollment']);
    Route::get('enrollments/{enrollment}/cor', [EnrollmentController::class, 'cor']);
    Route::apiResource('enrollments', EnrollmentController::class);
    Route::apiResource('enrollment-subjects', EnrollmentSubjectController::class);
    Route::post('assessments/{assessment}/installments', [AssessmentInstallmentController::class, 'store']);
    Route::get('assessments/{assessment}/summary', [AssessmentController::class, 'summary']);
    Route::post('installments/{installment}/pay', [PaymentController::class, 'store']);
    Route::apiResource('faculty', InstructorController::class)
        ->parameters(['faculty' => 'instructor']);
    Route::apiResource('instructors', InstructorController::class);
    Route::apiResource('programs', ProgramController::class);
    Route::apiResource('semesters', SemesterController::class);
    Route::apiResource('students', StudentController::class);
    Route::post('students/{id}/restore', [StudentController::class, 'restore']);
    Route::get('students/{student}/transcript', [TranscriptController::class, 'show']);
    Route::apiResource('subjects', SubjectController::class);
});

Route::middleware(['auth:sanctum', 'role:Faculty'])->group(function () {
    Route::put('enrollment-subjects/{enrollmentSubject}/grade', [EnrollmentSubjectController::class, 'updateGrade']);
    Route::post('enrollment-subjects/{enrollmentSubject}/submit', [EnrollmentSubjectController::class, 'submitGrade']);
});
