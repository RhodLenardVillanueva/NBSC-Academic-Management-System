<?php

namespace Tests\Feature;

// File: backend/tests/Feature/EnrollmentCorTest.php

use App\Models\AcademicYear;
use App\Models\Assessment;
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

class EnrollmentCorTest extends TestCase
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

    public function test_can_get_cor(): void
    {
        $this->authenticateAdmin();

        $program = Program::factory()->create([
            'name' => 'BS Information Technology',
        ]);

        $student = Student::factory()->create([
            'student_number' => '2026-0001',
            'first_name' => 'Ana',
            'last_name' => 'Santos',
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

        $instructor = Instructor::create([
            'employee_number' => 'EMP-2001',
            'first_name' => 'Carlos',
            'last_name' => 'Reyes',
            'email' => 'carlos.reyes@example.com',
            'department' => 'Information Technology',
            'status' => 'active',
        ]);

        $subjectA = Subject::create([
            'code' => 'CS401',
            'title' => 'Software Engineering',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $subjectB = Subject::create([
            'code' => 'CS402',
            'title' => 'Networks',
            'description' => null,
            'units' => 4,
            'lecture_hours' => 3,
            'lab_hours' => 1,
            'is_active' => true,
        ]);

        $courseOfferingA = CourseOffering::create([
            'subject_id' => $subjectA->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'A',
            'schedule' => 'MWF 9:00-10:00',
            'room' => 'Room 401',
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
            'schedule' => 'TTH 10:00-11:30',
            'room' => 'Room 402',
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

        Assessment::create([
            'enrollment_id' => $enrollment->id,
            'tuition_amount' => 15000,
            'miscellaneous_amount' => 1500,
            'other_fees_amount' => 500,
            'discount_amount' => 1000,
            'total_amount' => 16000,
        ]);

        EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOfferingA->id,
        ]);

        EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOfferingB->id,
        ]);

        $response = $this->getJson('/api/enrollments/'.$enrollment->id.'/cor');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.enrollment_id', $enrollment->id)
            ->assertJsonCount(2, 'data.subjects')
            ->assertJsonPath('data.total_units', 7)
            ->assertJsonPath('data.assessment.total', '16000.00');
    }
}
