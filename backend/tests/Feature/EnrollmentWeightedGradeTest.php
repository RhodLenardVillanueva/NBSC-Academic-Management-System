<?php

namespace Tests\Feature;

// File: backend/tests/Feature/EnrollmentWeightedGradeTest.php

use App\Models\AcademicYear;
use App\Models\CourseOffering;
use App\Models\Enrollment;
use App\Models\EnrollmentSubject;
use App\Models\Instructor;
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

        $instructor = Instructor::create([
            'employee_number' => 'EMP-5001',
            'first_name' => 'Sofia',
            'last_name' => 'Cruz',
            'email' => 'sofia.cruz@example.com',
            'department' => 'Software Engineering',
            'status' => 'active',
        ]);

        $courseOfferingA = CourseOffering::create([
            'subject_id' => $subjectA->id,
            'instructor_id' => $instructor->id,
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
            'instructor_id' => $instructor->id,
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
            'instructor_id' => $instructor->id,
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
            'quizzes' => 90,
            'projects' => 90,
            'participation' => 90,
            'major_exams' => 90,
        ]);

        $first->refresh();

        $this->assertSame('90.00', $first->final_numeric_grade);
        $this->assertSame('3.25', $first->grade_point);
        $this->assertSame('Passed', $first->remarks);

        $second = EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOfferingB->id,
            'quizzes' => 60,
            'projects' => 60,
            'participation' => 60,
            'major_exams' => 60,
        ]);

        $second->refresh();

        $this->assertSame('60.00', $second->final_numeric_grade);
        $this->assertSame('0.00', $second->grade_point);
        $this->assertSame('Failed', $second->remarks);

        $inc = EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOfferingC->id,
            'quizzes' => 85,
            'projects' => 85,
            'participation' => 85,
            'major_exams' => null,
        ]);

        $inc->refresh();

        $this->assertNull($inc->final_numeric_grade);
        $this->assertNull($inc->grade_point);
        $this->assertNull($inc->remarks);
    }
}
