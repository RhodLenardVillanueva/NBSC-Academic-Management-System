<?php

namespace Tests\Feature;

// File: backend/tests/Feature/AssessmentComputationTest.php

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

class AssessmentComputationTest extends TestCase
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

    public function test_assessment_total_includes_adjustments(): void
    {
        $this->authenticateAdmin();

        $enrollment = $this->seedEnrollment();

        $payload = [
            'tuition_amount' => 18000,
            'miscellaneous_amount' => 1500,
            'other_fees_amount' => 750,
            'discount_amount' => 2000,
            'adjustments' => [
                ['description' => 'Scholarship', 'amount' => -500],
                ['description' => 'Lab fee', 'amount' => 250],
            ],
        ];

        $response = $this->postJson('/api/enrollments/'.$enrollment->id.'/assessment', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total', '18000.00')
        ;
    }
}
