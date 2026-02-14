<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/EnrollmentController.php

use App\Http\Requests\Enrollment\StoreEnrollmentRequest;
use App\Http\Requests\Enrollment\UpdateEnrollmentRequest;
use App\Models\Assessment;
use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use App\Services\AssessmentService;
use Illuminate\Http\JsonResponse;

class EnrollmentController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $enrollments = Enrollment::query()
            ->orderByDesc('id')
            ->paginate(20);

        return $this->success($enrollments, 'Enrollments retrieved.');
    }

    public function store(StoreEnrollmentRequest $request): JsonResponse
    {
        $enrollment = Enrollment::create($request->validated());

        return $this->success($enrollment, 'Enrollment created.', 201);
    }

    public function show(Enrollment $enrollment): JsonResponse
    {
        return $this->success($enrollment, 'Enrollment retrieved.');
    }

    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment): JsonResponse
    {
        $enrollment->update($request->validated());

        return $this->success($enrollment, 'Enrollment updated.');
    }

    public function destroy(Enrollment $enrollment): JsonResponse
    {
        $enrollment->delete();

        return $this->success(null, 'Enrollment deleted.');
    }

    public function cor(Enrollment $enrollment, AssessmentService $assessmentService): JsonResponse
    {
        $enrollment->load(['student', 'program', 'academicYear', 'semester']);

        $enrollmentSubjects = EnrollmentSubject::query()
            ->with(['courseOffering.subject', 'courseOffering.instructor'])
            ->where('enrollment_id', $enrollment->id)
            ->get();

        $subjects = $enrollmentSubjects->map(function (EnrollmentSubject $enrollmentSubject): array {
            $courseOffering = $enrollmentSubject->courseOffering;
            $subject = $courseOffering?->subject;
            $instructor = $courseOffering?->instructor;

            return [
                'enrollment_subject_id' => $enrollmentSubject->id,
                'course_offering_id' => $courseOffering?->id,
                'subject_code' => $subject?->code,
                'subject_title' => $subject?->title,
                'units' => $subject?->units,
                'section' => $courseOffering?->section,
                'schedule' => $courseOffering?->schedule,
                'room' => $courseOffering?->room,
                'faculty' => $instructor?->full_name,
            ];
        })->values();

        $assessment = Assessment::query()
            ->with(['installments.payments', 'adjustments'])
            ->where('enrollment_id', $enrollment->id)
            ->first();

        return $this->success([
            'enrollment_id' => $enrollment->id,
            'enrollment' => [
                'id' => $enrollment->id,
                'year_level' => $enrollment->year_level,
                'status' => $enrollment->status,
                'total_units' => $enrollment->total_units,
            ],
            'student' => [
                'id' => $enrollment->student?->id,
                'student_number' => $enrollment->student?->student_number,
                'first_name' => $enrollment->student?->first_name,
                'last_name' => $enrollment->student?->last_name,
            ],
            'program' => [
                'id' => $enrollment->program?->id,
                'name' => $enrollment->program?->name,
            ],
            'academic_year' => [
                'id' => $enrollment->academicYear?->id,
                'name' => $enrollment->academicYear?->name,
            ],
            'semester' => [
                'id' => $enrollment->semester?->id,
                'name' => $enrollment->semester?->name,
            ],
            'subjects' => $subjects,
            'total_units' => $enrollment->total_units,
            'assessment' => $assessment
                ? $assessmentService->buildAssessmentPayload($assessment)
                : null,
        ], 'COR retrieved.');
    }
}
