<?php

namespace Tests\Feature;

// File: backend/tests/Feature/EnrollmentUnitsTest.php

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

class EnrollmentUnitsTest extends TestCase
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
            'code' => 'CS301',
            'title' => 'Algorithms',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $subjectB = Subject::create([
            'code' => 'CS302',
            'title' => 'Operating Systems',
            'description' => null,
            'units' => 4,
            'lecture_hours' => 3,
            'lab_hours' => 1,
            'is_active' => true,
        ]);

        $instructor = Instructor::create([
            'employee_number' => 'EMP-4001',
            'first_name' => 'Marco',
            'last_name' => 'Villanueva',
            'email' => 'marco.villanueva@example.com',
            'department' => 'Computer Engineering',
            'status' => 'active',
        ]);

        $courseOfferingA = CourseOffering::create([
            'subject_id' => $subjectA->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'A',
            'schedule' => 'MWF 8:00-9:00',
            'room' => 'Room 301',
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
            'room' => 'Room 302',
            'max_slots' => 50,
            'slots_taken' => 0,
            'is_active' => true,
        ]);

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 3,
            'total_units' => 0,
            'status' => 'enrolled',
        ]);

        return [$enrollment, $courseOfferingA, $courseOfferingB];
    }

    public function test_updates_total_units_when_subjects_change(): void
    {
        $this->authenticateAdmin();

        [$enrollment, $courseOfferingA, $courseOfferingB] = $this->seedDependencies();

        $first = EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOfferingA->id,
        ]);

        $enrollment->refresh();
        $this->assertSame(3, $enrollment->total_units);

        $second = EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOfferingB->id,
        ]);

        $enrollment->refresh();
        $this->assertSame(7, $enrollment->total_units);

        $second->delete();

        $enrollment->refresh();
        $this->assertSame(3, $enrollment->total_units);

        $first->delete();

        $enrollment->refresh();
        $this->assertSame(0, $enrollment->total_units);
    }
}
