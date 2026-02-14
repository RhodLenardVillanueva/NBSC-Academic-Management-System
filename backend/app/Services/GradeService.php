<?php

namespace App\Services;

// File: backend/app/Services/GradeService.php

use App\Models\EnrollmentSubject;

class GradeService
{
    /**
     * @return array{final_numeric_grade: float, grade_point: float, remarks: string}|null
     */
    public function compute(
        ?float $quizzes,
        ?float $projects,
        ?float $participation,
        ?float $majorExams
    ): ?array {
        if ($quizzes === null || $projects === null || $participation === null || $majorExams === null) {
            return null;
        }

        $finalNumeric = round(
            ($quizzes * 0.25) +
            ($projects * 0.25) +
            ($participation * 0.20) +
            ($majorExams * 0.30),
            2
        );

        $gradePoint = $this->mapGradePoint($finalNumeric);

        return [
            'final_numeric_grade' => $finalNumeric,
            'grade_point' => $gradePoint,
            'remarks' => $finalNumeric >= 70 ? 'Passed' : 'Failed',
        ];
    }

    public function apply(EnrollmentSubject $enrollmentSubject): void
    {
        $result = $this->compute(
            $this->toFloat($enrollmentSubject->quizzes),
            $this->toFloat($enrollmentSubject->projects),
            $this->toFloat($enrollmentSubject->participation),
            $this->toFloat($enrollmentSubject->major_exams)
        );

        if ($result === null) {
            $enrollmentSubject->final_numeric_grade = null;
            $enrollmentSubject->grade_point = null;
            $enrollmentSubject->remarks = null;

            return;
        }

        $enrollmentSubject->final_numeric_grade = $result['final_numeric_grade'];
        $enrollmentSubject->grade_point = $result['grade_point'];
        $enrollmentSubject->remarks = $result['remarks'];
    }

    public function mapGradePoint(float $finalNumeric): float
    {
        if ($finalNumeric >= 97) {
            return 4.0;
        }

        if ($finalNumeric >= 95) {
            return 3.75;
        }

        if ($finalNumeric >= 92) {
            return 3.5;
        }

        if ($finalNumeric >= 90) {
            return 3.25;
        }

        if ($finalNumeric >= 88) {
            return 3.0;
        }

        if ($finalNumeric >= 86) {
            return 2.75;
        }

        if ($finalNumeric >= 83) {
            return 2.5;
        }

        if ($finalNumeric >= 81) {
            return 2.25;
        }

        if ($finalNumeric >= 79) {
            return 2.0;
        }

        if ($finalNumeric >= 77) {
            return 1.75;
        }

        if ($finalNumeric >= 74) {
            return 1.5;
        }

        if ($finalNumeric >= 71) {
            return 1.25;
        }

        if ($finalNumeric >= 70) {
            return 1.0;
        }

        return 0.0;
    }

    private function toFloat(mixed $value): ?float
    {
        if ($value === null) {
            return null;
        }

        return (float) $value;
    }
}
