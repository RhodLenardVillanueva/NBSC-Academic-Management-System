<?php

namespace Tests\Feature;

// File: backend/tests/Feature/EnrollmentWeightedGradeTest.php

use App\Models\AcademicYear;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use App\Models\Program;
use App\Models\Role;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EnrollmentWeightedGradeTest extends TestCase
{
    use RefreshDatabase;

    private function authenticateAdmin(): void
    {
        $this->seed(RoleSeeder::class);

        $adminRole = Role::where('name', 'Admin')->first();

        $this->assertNotNull($adminRole);

        $user = User::factory()->create([
            'email' => 'admin@example.com',
        ]);

        $user->roles()->syncWithoutDetaching([$adminRole->id]);

        Sanctum::actingAs($user, ['*']);
    }

    private function seedDependencies(): array
    {
        $program = Program::factory()->create();
        $student = Student::factory()->create([
            'program_id' => $program->id,
        ]);
        $academicYear = AcademicYear::create([
            'name' => '2026-2027',
            'is_active' => true,
        ]);
        $semester = Semester::create([
            'academic_year_id' => $academicYear->id,
            'name' => '1st Semester',
            'is_current' => true,
        ]);

        $subjectA = Subject::create([
            'code' => 'CS501',
            'title' => 'Advanced Topics I',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $subjectB = Subject::create([
            'code' => 'CS502',
            'title' => 'Advanced Topics II',
            'description' => null,
            'units' => 4,
            'lecture_hours' => 3,
            'lab_hours' => 1,
            'is_active' => true,
        ]);

        $subjectC = Subject::create([
            'code' => 'CS503',
            'title' => 'Advanced Topics III',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $courseOfferingA = CourseOffering::create([
            'subject_id' => $subjectA->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'A',
            'schedule' => 'MWF 8:00-9:00',
            'room' => 'Room 501',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $courseOfferingB = CourseOffering::create([
            'subject_id' => $subjectB->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'B',
            'schedule' => 'TTH 9:00-10:30',
            'room' => 'Room 502',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $courseOfferingC = CourseOffering::create([
            'subject_id' => $subjectC->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'C',
            'schedule' => 'TTH 13:00-14:30',
            'room' => 'Room 503',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 4,
            'total_units' => 0,
            'status' => 'enrolled',
        ]);

        return [$enrollment, $courseOfferingA, $courseOfferingB, $courseOfferingC];
    }

    public function test_weighted_grades_are_computed(): void
    {
        $this->authenticateAdmin();

        [$enrollment, $courseOfferingA, $courseOfferingB, $courseOfferingC] = $this->seedDependencies();

        $first = EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOfferingA->id,
            'quiz_score' => 90,
            'case_study_score' => 90,
            'participation_score' => 90,
            'major_exam_score' => 90,
        ]);

        $first->refresh();

        $this->assertSame('90.00', $first->final_numeric_grade);
        $this->assertSame('3.25', $first->equivalent_grade);
        $this->assertSame('3.25', $first->grade_description);
        $this->assertSame('PASSED', $first->remarks);

        $second = EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOfferingB->id,
            'quiz_score' => 60,
            'case_study_score' => 60,
            'participation_score' => 60,
            'major_exam_score' => 60,
        ]);

        $second->refresh();

        $this->assertSame('60.00', $second->final_numeric_grade);
        $this->assertSame('0.00', $second->equivalent_grade);
        $this->assertSame('0.00', $second->grade_description);
        $this->assertSame('FAILED', $second->remarks);

        $inc = EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOfferingC->id,
            'quiz_score' => 85,
            'case_study_score' => 85,
            'participation_score' => 85,
            'major_exam_score' => null,
        ]);

        $inc->refresh();

        $this->assertNull($inc->final_numeric_grade);
        $this->assertNull($inc->equivalent_grade);
        $this->assertNull($inc->grade_description);
        $this->assertSame('INC', $inc->remarks);
    }
}
