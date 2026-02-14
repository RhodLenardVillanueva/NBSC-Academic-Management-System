<?php

namespace Tests\Feature;

// File: backend/tests/Feature/InstallmentPaymentTest.php

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

class InstallmentPaymentTest extends TestCase
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

    public function test_can_create_installments_and_pay(): void
    {
        $this->authenticateAdmin();

        $enrollment = $this->seedEnrollment();

        $assessment = Assessment::create([
            'enrollment_id' => $enrollment->id,
            'tuition_amount' => 15000,
            'miscellaneous_amount' => 1500,
            'other_fees_amount' => 500,
            'discount_amount' => 1000,
            'total_amount' => 16000,
        ]);

        $installmentResponse = $this->postJson('/api/assessments/'.$assessment->id.'/installments', [
            'plan_type' => 'full',
            'due_date' => '2026-03-01',
            'description' => 'Full payment',
        ]);

        $installmentResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.amount', '16000.00');

        $installmentId = $installmentResponse->json('data.0.id');

        $paymentResponse = $this->postJson('/api/installments/'.$installmentId.'/pay', [
            'amount' => 16000,
            'paid_at' => '2026-03-01 08:00:00',
            'receipt_number' => 'RCPT-0001',
        ]);

        $paymentResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.receipt_number', 'RCPT-0001');

        $summaryResponse = $this->getJson('/api/assessments/'.$assessment->id.'/summary');

        $summaryResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_outstanding', '0.00')
            ->assertJsonPath('data.installments.0.is_paid', true);
    }
}
