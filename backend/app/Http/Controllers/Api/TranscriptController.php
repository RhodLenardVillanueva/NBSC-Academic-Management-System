<?php

namespace App\Http\Controllers\Api;

// File: backend/app/Http/Controllers/Api/TranscriptController.php

use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use App\Models\Student;
use Illuminate\Http\JsonResponse;

class TranscriptController extends BaseApiController
{
    public function show(Student $student): JsonResponse
    {
        $enrollments = Enrollment::query()
            ->with(['academicYear', 'semester'])
            ->where('student_id', $student->id)
            ->orderBy('academic_year_id')
            ->orderBy('semester_id')
            ->get();

        $enrollmentIds = $enrollments->pluck('id');

        $subjectsByEnrollment = $enrollmentIds->isEmpty()
            ? collect()
            : EnrollmentSubject::query()
                ->with('courseOffering.subject')
                ->whereIn('enrollment_id', $enrollmentIds)
                ->get()
                ->groupBy('enrollment_id');

        $cumulativeUnits = 0;
        $cumulativePoints = 0.0;

        $semesters = $enrollments->map(function (Enrollment $enrollment) use (
            $subjectsByEnrollment,
            &$cumulativeUnits,
            &$cumulativePoints
        ): array {
            $subjects = $subjectsByEnrollment->get($enrollment->id, collect());
            $semesterUnits = 0;
            $semesterPoints = 0.0;

            $subjectEntries = $subjects->map(function (EnrollmentSubject $enrollmentSubject) use (
                &$semesterUnits,
                &$semesterPoints
            ): array {
                $courseOffering = $enrollmentSubject->courseOffering;
                $subject = $courseOffering?->subject;

                $units = $subject?->units;
                $unitsValue = $units !== null ? (int) $units : 0;

                $percentage = $enrollmentSubject->final_numeric_grade !== null
                    ? round((float) $enrollmentSubject->final_numeric_grade, 2)
                    : null;

                $equivalent = $enrollmentSubject->grade_point !== null
                    ? round((float) $enrollmentSubject->grade_point, 2)
                    : null;

                if ($equivalent !== null && $unitsValue > 0) {
                    $semesterUnits += $unitsValue;
                    $semesterPoints += $equivalent * $unitsValue;
                }

                return [
                    'code' => $subject?->code,
                    'title' => $subject?->title,
                    'units' => $units,
                    'percentage' => $percentage,
                    'equivalent_grade' => $equivalent,
                    'remarks' => $enrollmentSubject->remarks,
                ];
            })->values();

            $semesterGwa = $semesterUnits > 0
                ? round($semesterPoints / $semesterUnits, 2)
                : null;

            if ($semesterUnits > 0) {
                $cumulativeUnits += $semesterUnits;
                $cumulativePoints += $semesterPoints;
            }

            return [
                'academic_year' => [
                    'id' => $enrollment->academicYear?->id,
                    'name' => $enrollment->academicYear?->name,
                ],
                'semester' => [
                    'id' => $enrollment->semester?->id,
                    'name' => $enrollment->semester?->name,
                ],
                'subjects' => $subjectEntries,
                'semester_gwa' => $semesterGwa,
            ];
        })->values();

        $cumulativeGwa = $cumulativeUnits > 0
            ? round($cumulativePoints / $cumulativeUnits, 2)
            : null;

        return $this->success([
            'student' => [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
            ],
            'semesters' => $semesters,
            'cumulative_gwa' => $cumulativeGwa,
        ], 'Transcript retrieved.');
    }
}
