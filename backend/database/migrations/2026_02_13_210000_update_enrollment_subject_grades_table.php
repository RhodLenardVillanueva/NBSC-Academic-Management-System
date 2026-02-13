<?php

// File: backend/database/migrations/2026_02_13_210000_update_enrollment_subject_grades_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        $columnsToDrop = [];

        foreach (['midterm_grade', 'final_grade', 'computed_grade'] as $column) {
            if (Schema::hasColumn('enrollment_subjects', $column)) {
                $columnsToDrop[] = $column;
            }
        }

        if ($driver !== 'sqlite' && $columnsToDrop !== []) {
            Schema::table('enrollment_subjects', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }

        $needsQuizScore = ! Schema::hasColumn('enrollment_subjects', 'quiz_score');
        $needsCaseStudyScore = ! Schema::hasColumn('enrollment_subjects', 'case_study_score');
        $needsParticipationScore = ! Schema::hasColumn('enrollment_subjects', 'participation_score');
        $needsMajorExamScore = ! Schema::hasColumn('enrollment_subjects', 'major_exam_score');
        $needsFinalNumericGrade = ! Schema::hasColumn('enrollment_subjects', 'final_numeric_grade');
        $needsEquivalentGrade = ! Schema::hasColumn('enrollment_subjects', 'equivalent_grade');
        $needsGradeDescription = ! Schema::hasColumn('enrollment_subjects', 'grade_description');
        $needsRemarks = ! Schema::hasColumn('enrollment_subjects', 'remarks');

        if (
            $needsQuizScore ||
            $needsCaseStudyScore ||
            $needsParticipationScore ||
            $needsMajorExamScore ||
            $needsFinalNumericGrade ||
            $needsEquivalentGrade ||
            $needsGradeDescription ||
            $needsRemarks
        ) {
            Schema::table('enrollment_subjects', function (Blueprint $table) use (
                $needsQuizScore,
                $needsCaseStudyScore,
                $needsParticipationScore,
                $needsMajorExamScore,
                $needsFinalNumericGrade,
                $needsEquivalentGrade,
                $needsGradeDescription,
                $needsRemarks
            ) {
                if ($needsQuizScore) {
                    $table->decimal('quiz_score', 5, 2)->nullable();
                }

                if ($needsCaseStudyScore) {
                    $table->decimal('case_study_score', 5, 2)->nullable();
                }

                if ($needsParticipationScore) {
                    $table->decimal('participation_score', 5, 2)->nullable();
                }

                if ($needsMajorExamScore) {
                    $table->decimal('major_exam_score', 5, 2)->nullable();
                }

                if ($needsFinalNumericGrade) {
                    $table->decimal('final_numeric_grade', 5, 2)->nullable();
                }

                if ($needsEquivalentGrade) {
                    $table->decimal('equivalent_grade', 4, 2)->nullable();
                }

                if ($needsGradeDescription) {
                    $table->string('grade_description')->nullable();
                }

                if ($needsRemarks) {
                    $table->string('remarks')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $columnsToDrop = [];

        foreach ([
            'quiz_score',
            'case_study_score',
            'participation_score',
            'major_exam_score',
            'final_numeric_grade',
            'equivalent_grade',
            'grade_description',
        ] as $column) {
            if (Schema::hasColumn('enrollment_subjects', $column)) {
                $columnsToDrop[] = $column;
            }
        }

        if ($columnsToDrop !== []) {
            Schema::table('enrollment_subjects', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn($columnsToDrop);
            });
        }

        $driver = Schema::getConnection()->getDriverName();

        if ($driver !== 'sqlite') {
            $needsMidterm = ! Schema::hasColumn('enrollment_subjects', 'midterm_grade');
            $needsFinal = ! Schema::hasColumn('enrollment_subjects', 'final_grade');
            $needsComputed = ! Schema::hasColumn('enrollment_subjects', 'computed_grade');

            if ($needsMidterm || $needsFinal || $needsComputed) {
                Schema::table('enrollment_subjects', function (Blueprint $table) use (
                    $needsMidterm,
                    $needsFinal,
                    $needsComputed
                ) {
                    if ($needsMidterm) {
                        $table->decimal('midterm_grade', 5, 2)->nullable();
                    }

                    if ($needsFinal) {
                        $table->decimal('final_grade', 5, 2)->nullable();
                    }

                    if ($needsComputed) {
                        $table->decimal('computed_grade', 5, 2)->nullable();
                    }
                });
            }
        }
    }
};
