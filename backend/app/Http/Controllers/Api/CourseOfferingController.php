<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/CourseOfferingController.php

use App\Http\Requests\CourseOffering\StoreCourseOfferingRequest;
use App\Http\Requests\CourseOffering\UpdateCourseOfferingRequest;
use App\Models\CourseOffering;
use App\Models\EnrollmentSubject;
use App\Models\Instructor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CourseOfferingController extends BaseApiController
{
    public function index(): JsonResponse
    {
        $courseOfferings = CourseOffering::query()
            ->withCount(['enrollmentSubjects as slots_taken'])
            ->orderByDesc('id')
            ->paginate(20);

        return $this->success($courseOfferings, 'Course offerings retrieved.');
    }

    public function store(StoreCourseOfferingRequest $request): JsonResponse
    {
        $courseOffering = CourseOffering::create($request->validated());
        $courseOffering->loadCount(['enrollmentSubjects as slots_taken']);

        return $this->success($courseOffering, 'Course offering created.', 201);
    }

    public function show(CourseOffering $courseOffering): JsonResponse
    {
        $courseOffering->loadCount(['enrollmentSubjects as slots_taken']);
        return $this->success($courseOffering, 'Course offering retrieved.');
    }

    public function update(UpdateCourseOfferingRequest $request, CourseOffering $courseOffering): JsonResponse
    {
        $courseOffering->update($request->validated());
        $courseOffering->loadCount(['enrollmentSubjects as slots_taken']);

        return $this->success($courseOffering, 'Course offering updated.');
    }

    public function destroy(CourseOffering $courseOffering): JsonResponse
    {
        $courseOffering->delete();

        return $this->success(null, 'Course offering deleted.');
    }

    public function facultyIndex(Request $request): JsonResponse
    {
        Gate::authorize('viewFacultyCourseOfferings');

        $user = $request->user();

        $query = CourseOffering::query()
            ->with(['subject', 'semester', 'academicYear', 'instructor'])
            ->withCount(['enrollmentSubjects as enrolled_count'])
            ->orderByDesc('id');

        if (
            $user !== null &&
            $user->roles()->where('name', 'Faculty')->exists() &&
            ! $user->roles()->whereIn('name', ['Admin', 'Registrar'])->exists()
        ) {
            if ($user->email === null) {
                $query->whereRaw('1 = 0');
            } else {
                $instructor = Instructor::query()
                    ->whereRaw('lower(email) = ?', [strtolower($user->email)])
                    ->first();

                if ($instructor) {
                    $query->where('instructor_id', $instructor->id);
                } else {
                    $query->whereRaw('1 = 0');
                }
            }
        }

        $courseOfferings = $query->paginate(20);

        return $this->success($courseOfferings, 'Faculty course offerings retrieved.');
    }

    public function students(CourseOffering $courseOffering): JsonResponse
    {
        $courseOffering->load(['subject', 'semester', 'academicYear', 'instructor']);

        Gate::authorize('viewCourseOfferingStudents', $courseOffering);

        $enrollmentSubjects = EnrollmentSubject::query()
            ->with(['enrollment.student', 'enrollment.program'])
            ->where('course_offering_id', $courseOffering->id)
            ->orderBy('id')
            ->get();

        $students = $enrollmentSubjects->map(function (EnrollmentSubject $enrollmentSubject): array {
            $enrollment = $enrollmentSubject->enrollment;
            $student = $enrollment?->student;
            $program = $enrollment?->program;

            return [
                'enrollment_subject_id' => $enrollmentSubject->id,
                'student' => [
                    'id' => $student?->id,
                    'student_number' => $student?->student_number,
                    'first_name' => $student?->first_name,
                    'last_name' => $student?->last_name,
                    'program' => $program?->name,
                ],
                'quizzes' => $enrollmentSubject->quizzes,
                'projects' => $enrollmentSubject->projects,
                'participation' => $enrollmentSubject->participation,
                'major_exams' => $enrollmentSubject->major_exams,
                'final_numeric_grade' => $enrollmentSubject->final_numeric_grade,
                'grade_point' => $enrollmentSubject->grade_point,
                'remarks' => $enrollmentSubject->remarks,
                'is_submitted' => $enrollmentSubject->is_submitted,
                'submitted_at' => $enrollmentSubject->submitted_at,
            ];
        })->values();

        return $this->success([
            'course_offering' => [
                'id' => $courseOffering->id,
                'subject' => [
                    'code' => $courseOffering->subject?->code,
                    'title' => $courseOffering->subject?->title,
                ],
                'section' => $courseOffering->section,
                'semester' => [
                    'id' => $courseOffering->semester?->id,
                    'name' => $courseOffering->semester?->name,
                ],
                'academic_year' => [
                    'id' => $courseOffering->academicYear?->id,
                    'name' => $courseOffering->academicYear?->name,
                ],
                'instructor' => $courseOffering->instructor?->full_name,
            ],
            'students' => $students,
        ], 'Course offering students retrieved.');
    }
}
