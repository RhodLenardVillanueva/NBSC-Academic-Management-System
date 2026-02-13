<?php

namespace App\Models;

// File: backend/app/Models/EnrollmentSubject.php

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnrollmentSubject extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'enrollment_id',
        'course_offering_id',
        'quiz_score',
        'case_study_score',
        'participation_score',
        'major_exam_score',
        'final_numeric_grade',
        'equivalent_grade',
        'grade_description',
        'remarks',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quiz_score' => 'decimal:2',
            'case_study_score' => 'decimal:2',
            'participation_score' => 'decimal:2',
            'major_exam_score' => 'decimal:2',
            'final_numeric_grade' => 'decimal:2',
            'equivalent_grade' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (EnrollmentSubject $enrollmentSubject): void {
            $quiz = $enrollmentSubject->quiz_score;
            $caseStudy = $enrollmentSubject->case_study_score;
            $participation = $enrollmentSubject->participation_score;
            $majorExam = $enrollmentSubject->major_exam_score;

            if ($quiz === null || $caseStudy === null || $participation === null || $majorExam === null) {
                $enrollmentSubject->final_numeric_grade = null;
                $enrollmentSubject->equivalent_grade = null;
                $enrollmentSubject->grade_description = null;
                $enrollmentSubject->remarks = 'INC';

                return;
            }

            $finalNumeric = round(
                ($quiz * 0.25) +
                ($caseStudy * 0.25) +
                ($participation * 0.20) +
                ($majorExam * 0.30),
                2
            );

            $equivalent = self::mapEquivalentGrade($finalNumeric);

            $enrollmentSubject->final_numeric_grade = $finalNumeric;
            $enrollmentSubject->equivalent_grade = $equivalent;
            $enrollmentSubject->grade_description = number_format($equivalent, 2);
            $enrollmentSubject->remarks = $finalNumeric >= 70 ? 'PASSED' : 'FAILED';
        });

        static::created(function (EnrollmentSubject $enrollmentSubject): void {
            $enrollment = $enrollmentSubject->enrollment;
            $courseOffering = $enrollmentSubject->courseOffering;
            $subject = $courseOffering?->subject;

            if (! $enrollment || ! $subject) {
                return;
            }

            $units = (int) $subject->units;

            $enrollment->total_units = (int) $enrollment->total_units + $units;
            $enrollment->save();
        });

        static::deleted(function (EnrollmentSubject $enrollmentSubject): void {
            $enrollment = $enrollmentSubject->enrollment;
            $courseOffering = $enrollmentSubject->courseOffering;
            $subject = $courseOffering?->subject;

            if (! $enrollment || ! $subject) {
                return;
            }

            $units = (int) $subject->units;
            $currentTotal = (int) $enrollment->total_units;
            $enrollment->total_units = max(0, $currentTotal - $units);
            $enrollment->save();
        });
    }

    private static function mapEquivalentGrade(float $finalNumeric): float
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

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function courseOffering(): BelongsTo
    {
        return $this->belongsTo(CourseOffering::class);
    }
}