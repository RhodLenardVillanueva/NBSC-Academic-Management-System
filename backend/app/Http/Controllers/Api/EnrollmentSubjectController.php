<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/EnrollmentSubjectController.php

use App\Http\Requests\EnrollmentSubject\StoreEnrollmentSubjectRequest;
use App\Http\Requests\EnrollmentSubject\UpdateEnrollmentSubjectRequest;
use App\Models\CourseOffering;
use App\Models\EnrollmentSubject;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EnrollmentSubjectController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $enrollmentSubjects = EnrollmentSubject::query()
            ->orderByDesc('id')
            ->paginate(20);

        return $this->success($enrollmentSubjects, 'Enrollment subjects retrieved.');
    }

    public function store(StoreEnrollmentSubjectRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();

            $courseOffering = CourseOffering::whereKey($data['course_offering_id'])
                ->lockForUpdate()
                ->first();

            if (! $courseOffering) {
                throw ValidationException::withMessages([
                    'course_offering_id' => ['Course offering not found.'],
                ]);
            }

            if ($courseOffering->slots_taken >= $courseOffering->max_slots) {
                throw ValidationException::withMessages([
                    'course_offering_id' => ['Course offering is full.'],
                ]);
            }

            $enrollmentSubject = EnrollmentSubject::create($data);

            $courseOffering->increment('slots_taken');

            return $this->success($enrollmentSubject, 'Enrollment subject created.', 201);
        });
    }

    public function show(EnrollmentSubject $enrollmentSubject): JsonResponse
    {
        return $this->success($enrollmentSubject, 'Enrollment subject retrieved.');
    }

    public function update(UpdateEnrollmentSubjectRequest $request, EnrollmentSubject $enrollmentSubject): JsonResponse
    {
        $enrollmentSubject->update($request->validated());

        return $this->success($enrollmentSubject, 'Enrollment subject updated.');
    }

    public function destroy(EnrollmentSubject $enrollmentSubject): JsonResponse
    {
        return DB::transaction(function () use ($enrollmentSubject) {
            $courseOffering = CourseOffering::whereKey($enrollmentSubject->course_offering_id)
                ->lockForUpdate()
                ->first();

            $enrollmentSubject->delete();

            if ($courseOffering && $courseOffering->slots_taken > 0) {
                $courseOffering->decrement('slots_taken');
            }

            return $this->success(null, 'Enrollment subject deleted.');
        });
    }
}