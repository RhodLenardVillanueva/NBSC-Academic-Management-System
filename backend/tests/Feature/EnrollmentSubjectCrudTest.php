<?php

namespace Tests\Feature;

// File: backend/tests/Feature/EnrollmentSubjectCrudTest.php

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

class EnrollmentSubjectCrudTest extends TestCase
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
            'add_drop_start' => '2026-01-01',
            'add_drop_end' => '2026-12-31',
        ]);
        $subject = Subject::create([
            'code' => 'CS201',
            'title' => 'Data Structures',
            'description' => null,
            'units' => 4,
            'lecture_hours' => 3,
            'lab_hours' => 1,
            'is_active' => true,
        ]);
        $instructor = Instructor::create([
            'employee_number' => 'EMP-3001',
            'first_name' => 'Elena',
            'last_name' => 'Garcia',
            'email' => 'elena.garcia@example.com',
            'department' => 'Engineering',
            'status' => 'active',
        ]);
        $courseOffering = CourseOffering::create([
            'subject_id' => $subject->id,
            'instructor_id' => $instructor->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'section' => 'A',
            'schedule' => 'MWF 10:00-11:00',
            'room' => 'Room 201',
            'max_slots' => 1,
            'slots_taken' => 0,
            'is_active' => true,
        ]);
        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 2,
            'total_units' => 18,
            'status' => 'enrolled',
        ]);

        return [$enrollment, $courseOffering];
    }

    public function test_can_attach_subject_to_enrollment(): void
    {
        $this->authenticateAdmin();

        [$enrollment, $courseOffering] = $this->seedDependencies();

        $payload = [
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOffering->id,
        ];

        $response = $this->postJson('/api/enrollment-subjects', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('enrollment_subjects', [
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOffering->id,
        ]);

        $this->assertDatabaseHas('course_offerings', [
            'id' => $courseOffering->id,
            'slots_taken' => 1,
        ]);
    }

    public function test_prevents_duplicate_enrollment_subject(): void
    {
        $this->authenticateAdmin();

        [$enrollment, $courseOffering] = $this->seedDependencies();

        EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOffering->id,
        ]);

        $payload = [
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOffering->id,
        ];

        $response = $this->postJson('/api/enrollment-subjects', $payload);

        $response->assertStatus(422);
    }

    public function test_prevents_over_enrollment(): void
    {
        $this->authenticateAdmin();

        [$enrollment, $courseOffering] = $this->seedDependencies();

        EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOffering->id,
        ]);

        $program = Program::factory()->create();
        $student = Student::factory()->create([
            'program_id' => $program->id,
        ]);
        $secondEnrollment = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $enrollment->academic_year_id,
            'semester_id' => $enrollment->semester_id,
            'year_level' => 2,
            'total_units' => 0,
            'status' => 'enrolled',
        ]);

        $payload = [
            'enrollment_id' => $secondEnrollment->id,
            'course_offering_id' => $courseOffering->id,
        ];

        $response = $this->postJson('/api/enrollment-subjects', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('errors.course_offering_id.0', 'Course offering is full.');
    }

    public function test_decrements_slots_on_delete(): void
    {
        $this->authenticateAdmin();

        [$enrollment, $courseOffering] = $this->seedDependencies();

        $enrollmentSubject = EnrollmentSubject::create([
            'enrollment_id' => $enrollment->id,
            'course_offering_id' => $courseOffering->id,
        ]);

        $response = $this->deleteJson('/api/enrollment-subjects/'.$enrollmentSubject->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('course_offerings', [
            'id' => $courseOffering->id,
            'slots_taken' => 0,
        ]);
    }
}
