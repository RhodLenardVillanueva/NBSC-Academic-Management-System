<?php

namespace Tests\Feature;

// File: backend/tests/Feature/EnrollmentCrudTest.php

use App\Models\AcademicYear;
use App\Models\Enrollment;
use App\Models\Program;
use App\Models\Role;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EnrollmentCrudTest extends TestCase
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

    private function seedEnrollmentDependencies(): array
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

        return [$student, $program, $academicYear, $semester];
    }

    public function test_can_list_enrollments(): void
    {
        $this->authenticateAdmin();

        [$student, $program, $academicYear, $semester] = $this->seedEnrollmentDependencies();

        Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 1,
            'total_units' => 21,
            'status' => 'enrolled',
        ]);

        $otherStudent = Student::factory()->create([
            'program_id' => $program->id,
        ]);

        Enrollment::create([
            'student_id' => $otherStudent->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 2,
            'total_units' => 18,
            'status' => 'completed',
        ]);

        $response = $this->getJson('/api/enrollments');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.data');
    }

    public function test_can_create_enrollment(): void
    {
        $this->authenticateAdmin();

        [$student, $program, $academicYear, $semester] = $this->seedEnrollmentDependencies();

        $payload = [
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 1,
            'total_units' => 18,
            'status' => 'enrolled',
        ];

        $response = $this->postJson('/api/enrollments', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.student_id', $student->id);

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
        ]);
    }

    public function test_can_show_enrollment(): void
    {
        $this->authenticateAdmin();

        [$student, $program, $academicYear, $semester] = $this->seedEnrollmentDependencies();

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 1,
            'total_units' => 18,
            'status' => 'enrolled',
        ]);

        $response = $this->getJson('/api/enrollments/'.$enrollment->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $enrollment->id);
    }

    public function test_can_update_enrollment(): void
    {
        $this->authenticateAdmin();

        [$student, $program, $academicYear, $semester] = $this->seedEnrollmentDependencies();

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 1,
            'total_units' => 18,
            'status' => 'enrolled',
        ]);

        $payload = [
            'status' => 'completed',
            'total_units' => 24,
        ];

        $response = $this->putJson('/api/enrollments/'.$enrollment->id, $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('enrollments', [
            'id' => $enrollment->id,
            'status' => 'completed',
            'total_units' => 24,
        ]);
    }

    public function test_can_delete_enrollment(): void
    {
        $this->authenticateAdmin();

        [$student, $program, $academicYear, $semester] = $this->seedEnrollmentDependencies();

        $enrollment = Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 1,
            'total_units' => 18,
            'status' => 'enrolled',
        ]);

        $response = $this->deleteJson('/api/enrollments/'.$enrollment->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('enrollments', [
            'id' => $enrollment->id,
        ]);
    }

    public function test_unique_constraint_violation_on_enrollment(): void
    {
        $this->authenticateAdmin();

        [$student, $program, $academicYear, $semester] = $this->seedEnrollmentDependencies();

        Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 1,
            'total_units' => 18,
            'status' => 'enrolled',
        ]);

        $payload = [
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 1,
            'total_units' => 18,
            'status' => 'enrolled',
        ];

        $response = $this->postJson('/api/enrollments', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'The unique enrollment has already been taken.');
    }
}