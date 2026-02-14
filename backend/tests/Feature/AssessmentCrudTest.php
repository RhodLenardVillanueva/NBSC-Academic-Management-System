<?php

namespace Tests\Feature;

// File: backend/tests/Feature/AssessmentCrudTest.php

use App\Models\AcademicYear;
use App\Models\Assessment;
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

class AssessmentCrudTest extends TestCase
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

    private function seedEnrollment(): Enrollment
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

        return Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $program->id,
            'academic_year_id' => $academicYear->id,
            'semester_id' => $semester->id,
            'year_level' => 1,
            'total_units' => 0,
            'status' => 'enrolled',
        ]);
    }

    public function test_can_create_assessment_for_enrollment(): void
    {
        $this->authenticateAdmin();

        $enrollment = $this->seedEnrollment();

        $payload = [
            'tuition_amount' => 10000,
            'miscellaneous_amount' => 500,
            'other_fees_amount' => 200,
            'discount_amount' => 1000,
            'adjustments' => [
                ['description' => 'Scholarship', 'amount' => -500],
                ['description' => 'Lab fee', 'amount' => 300],
            ],
        ];

        $response = $this->postJson('/api/enrollments/'.$enrollment->id.'/assessment', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', '9500.00')
            ->assertJsonCount(2, 'data.adjustments');

        $this->assertDatabaseHas('assessments', [
            'enrollment_id' => $enrollment->id,
            'total_amount' => '9500.00',
        ]);
    }

    public function test_can_get_assessment_for_enrollment(): void
    {
        $this->authenticateAdmin();

        $enrollment = $this->seedEnrollment();

        Assessment::create([
            'enrollment_id' => $enrollment->id,
            'tuition_amount' => 12000,
            'miscellaneous_amount' => 700,
            'other_fees_amount' => 400,
            'discount_amount' => 500,
            'total_amount' => 12600,
        ]);

        $response = $this->getJson('/api/enrollments/'.$enrollment->id.'/assessment');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', '12600.00');
    }
}
