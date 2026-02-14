<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/EnrollmentSubjectController.php

use App\Http\Requests\EnrollmentSubject\StoreEnrollmentSubjectRequest;
use App\Http\Requests\EnrollmentSubject\UpdateEnrollmentSubjectGradeRequest;
use App\Http\Requests\EnrollmentSubject\UpdateEnrollmentSubjectRequest;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
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

            $enrollment = Enrollment::with('semester')->find($data['enrollment_id']);

            if (! $enrollment) {
                throw ValidationException::withMessages([
                    'enrollment_id' => ['Enrollment not found.'],
                ]);
            }

            $this->assertAddDropWindowOpen($enrollment);

            $courseOffering = CourseOffering::whereKey($data['course_offering_id'])
                ->lockForUpdate()
                ->first();

            if (! $courseOffering) {
                throw ValidationException::withMessages([
                    'course_offering_id' => ['Course offering not found.'],
                ]);
            }

            $currentCount = EnrollmentSubject::query()
                ->where('course_offering_id', $courseOffering->id)
                ->count();

            if ($currentCount >= $courseOffering->max_slots) {
                throw ValidationException::withMessages([
                    'course_offering_id' => ['Course offering is full.'],
                ]);
            }

            $enrollmentSubject = EnrollmentSubject::create($data);

            $courseOffering->update([
                'slots_taken' => $currentCount + 1,
            ]);

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
            $enrollmentSubject->load('enrollment.semester');
            if ($enrollmentSubject->enrollment) {
                $this->assertAddDropWindowOpen($enrollmentSubject->enrollment);
            }

            $courseOffering = CourseOffering::whereKey($enrollmentSubject->course_offering_id)
                ->lockForUpdate()
                ->first();

            $enrollmentSubject->delete();

            if ($courseOffering) {
                $updatedCount = EnrollmentSubject::query()
                    ->where('course_offering_id', $courseOffering->id)
                    ->count();

                $courseOffering->update([
                    'slots_taken' => $updatedCount,
                ]);
            }

            return $this->success(null, 'Enrollment subject deleted.');
        });
    }

    public function updateGrade(
        UpdateEnrollmentSubjectGradeRequest $request,
        EnrollmentSubject $enrollmentSubject
    ): JsonResponse {
        Gate::authorize('updateEnrollmentGrade', $enrollmentSubject);

        if ($enrollmentSubject->is_submitted) {
            throw ValidationException::withMessages([
                'grade' => ['Grades are locked.'],
            ]);
        }

        $enrollmentSubject->update($request->validated());

        return $this->success($enrollmentSubject->refresh(), 'Grade updated.');
    }

    public function submitGrade(EnrollmentSubject $enrollmentSubject): JsonResponse
    {
        Gate::authorize('submitEnrollmentGrade', $enrollmentSubject);

        if ($enrollmentSubject->is_submitted) {
            throw ValidationException::withMessages([
                'grade' => ['Grades are already submitted.'],
            ]);
        }

        if (
            $enrollmentSubject->quizzes === null ||
            $enrollmentSubject->projects === null ||
            $enrollmentSubject->participation === null ||
            $enrollmentSubject->major_exams === null ||
            $enrollmentSubject->final_numeric_grade === null ||
            $enrollmentSubject->grade_point === null
        ) {
            throw ValidationException::withMessages([
                'grade' => ['All grade components must be set before submission.'],
            ]);
        }

        $enrollmentSubject->is_submitted = true;
        $enrollmentSubject->submitted_at = now();
        $enrollmentSubject->save();

        return $this->success($enrollmentSubject->refresh(), 'Grade submitted.');
    }

    private function assertAddDropWindowOpen(Enrollment $enrollment): void
    {
        $semester = $enrollment->semester;

        if (! $semester) {
            throw ValidationException::withMessages([
                'add_drop_window' => ['Semester not found for enrollment.'],
            ]);
        }

        $start = $semester->add_drop_start;
        $end = $semester->add_drop_end;

        if (! $start || ! $end) {
            throw ValidationException::withMessages([
                'add_drop_window' => ['Add/drop window is not configured for this semester.'],
            ]);
        }

        $today = Carbon::today();

        if ($today->lt($start) || $today->gt($end)) {
            throw ValidationException::withMessages([
                'add_drop_window' => ['Add/drop period is closed.'],
            ]);
        }
    }
}
