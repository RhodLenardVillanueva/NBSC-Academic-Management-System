<?php

namespace App\Models;

// File: backend/app/Models/EnrollmentSubject.php

use App\Services\GradeService;
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
        'quizzes',
        'projects',
        'participation',
        'major_exams',
        'is_submitted',
        'submitted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quizzes' => 'decimal:2',
            'projects' => 'decimal:2',
            'participation' => 'decimal:2',
            'major_exams' => 'decimal:2',
            'final_numeric_grade' => 'decimal:2',
            'grade_point' => 'decimal:2',
            'is_submitted' => 'boolean',
            'submitted_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (EnrollmentSubject $enrollmentSubject): void {
            app(GradeService::class)->apply($enrollmentSubject);
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

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function courseOffering(): BelongsTo
    {
        return $this->belongsTo(CourseOffering::class);
    }
}
