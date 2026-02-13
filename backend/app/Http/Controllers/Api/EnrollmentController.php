<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/EnrollmentController.php

use App\Http\Requests\Enrollment\StoreEnrollmentRequest;
use App\Http\Requests\Enrollment\UpdateEnrollmentRequest;
use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
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

    public function cor(Enrollment $enrollment): JsonResponse
    {
        $enrollment->load(['student', 'program', 'academicYear', 'semester']);

        $enrollmentSubjects = EnrollmentSubject::query()
            ->with('courseOffering.subject')
            ->where('enrollment_id', $enrollment->id)
            ->get();

        $subjects = $enrollmentSubjects->map(function (EnrollmentSubject $enrollmentSubject): array {
            $courseOffering = $enrollmentSubject->courseOffering;
            $subject = $courseOffering?->subject;

            return [
                'subject_code' => $subject?->code,
                'subject_title' => $subject?->title,
                'units' => $subject?->units,
                'section' => $courseOffering?->section,
                'schedule' => $courseOffering?->schedule,
                'room' => $courseOffering?->room,
            ];
        })->values();

        return $this->success([
            'enrollment_id' => $enrollment->id,
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
        ], 'COR retrieved.');
    }
}
