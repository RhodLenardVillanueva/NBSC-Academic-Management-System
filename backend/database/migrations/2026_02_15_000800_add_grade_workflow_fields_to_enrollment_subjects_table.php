<?php

// File: backend/database/migrations/2026_02_15_000800_add_grade_workflow_fields_to_enrollment_subjects_table.php

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
        $columns = [
            'quizzes' => ! Schema::hasColumn('enrollment_subjects', 'quizzes'),
            'projects' => ! Schema::hasColumn('enrollment_subjects', 'projects'),
            'participation' => ! Schema::hasColumn('enrollment_subjects', 'participation'),
            'major_exams' => ! Schema::hasColumn('enrollment_subjects', 'major_exams'),
            'grade_point' => ! Schema::hasColumn('enrollment_subjects', 'grade_point'),
            'is_submitted' => ! Schema::hasColumn('enrollment_subjects', 'is_submitted'),
            'submitted_at' => ! Schema::hasColumn('enrollment_subjects', 'submitted_at'),
        ];

        if (! in_array(true, $columns, true)) {
            return;
        }

        Schema::table('enrollment_subjects', function (Blueprint $table) use ($columns) {
            if ($columns['quizzes']) {
                $table->decimal('quizzes', 5, 2)->nullable()->after('course_offering_id');
            }

            if ($columns['projects']) {
                $table->decimal('projects', 5, 2)->nullable()->after($columns['quizzes'] ? 'quizzes' : 'course_offering_id');
            }

            if ($columns['participation']) {
                $table->decimal('participation', 5, 2)->nullable()->after($columns['projects'] ? 'projects' : 'course_offering_id');
            }

            if ($columns['major_exams']) {
                $table->decimal('major_exams', 5, 2)->nullable()->after($columns['participation'] ? 'participation' : 'course_offering_id');
            }

            if ($columns['grade_point']) {
                $table->decimal('grade_point', 3, 2)->nullable();
            }

            if ($columns['is_submitted']) {
                $table->boolean('is_submitted')->default(false);
            }

            if ($columns['submitted_at']) {
                $table->dateTime('submitted_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $columns = [
            'quizzes',
            'projects',
            'participation',
            'major_exams',
            'grade_point',
            'is_submitted',
            'submitted_at',
        ];

        $columnsToDrop = array_values(array_filter($columns, static function (string $column): bool {
            return Schema::hasColumn('enrollment_subjects', $column);
        }));

        if ($columnsToDrop === []) {
            return;
        }

        Schema::table('enrollment_subjects', function (Blueprint $table) use ($columnsToDrop) {
            $table->dropColumn($columnsToDrop);
        });
    }
};
