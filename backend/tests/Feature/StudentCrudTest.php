<?php

namespace Tests\Feature;

// File: backend/tests/Feature/StudentCrudTest.php

use App\Models\Role;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentCrudTest extends TestCase
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

    public function test_can_list_students(): void
    {
        $this->authenticateAdmin();

        Student::create([
            'student_number' => 'STU-0001',
            'first_name' => 'Alice',
            'last_name' => 'Reyes',
            'program_id' => null,
            'year_level' => 1,
            'status' => 'active',
        ]);

        Student::create([
            'student_number' => 'STU-0002',
            'first_name' => 'Ben',
            'last_name' => 'Santos',
            'program_id' => null,
            'year_level' => 2,
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/students');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.data');
    }

    public function test_can_create_student(): void
    {
        $this->authenticateAdmin();

        $payload = [
            'student_number' => 'STU-0003',
            'first_name' => 'Carla',
            'last_name' => 'Dela Cruz',
            'program_id' => null,
            'year_level' => 1,
            'status' => 'active',
        ];

        $response = $this->postJson('/api/students', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.student_number', 'STU-0003');

        $this->assertDatabaseHas('students', [
            'student_number' => 'STU-0003',
            'first_name' => 'Carla',
            'last_name' => 'Dela Cruz',
        ]);
    }

    public function test_can_show_student(): void
    {
        $this->authenticateAdmin();

        $student = Student::create([
            'student_number' => 'STU-0004',
            'first_name' => 'Dina',
            'last_name' => 'Lopez',
            'program_id' => null,
            'year_level' => 3,
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/students/'.$student->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.student_number', 'STU-0004');
    }

    public function test_can_update_student(): void
    {
        $this->authenticateAdmin();

        $student = Student::create([
            'student_number' => 'STU-0005',
            'first_name' => 'Eric',
            'last_name' => 'Garcia',
            'program_id' => null,
            'year_level' => 4,
            'status' => 'active',
        ]);

        $payload = [
            'last_name' => 'Garcia-Smith',
            'status' => 'graduated',
        ];

        $response = $this->putJson('/api/students/'.$student->id, $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'graduated');

        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'last_name' => 'Garcia-Smith',
            'status' => 'graduated',
        ]);
    }

    public function test_can_delete_student(): void
    {
        $this->authenticateAdmin();

        $student = Student::create([
            'student_number' => 'STU-0006',
            'first_name' => 'Faye',
            'last_name' => 'Ibarra',
            'program_id' => null,
            'year_level' => 2,
            'status' => 'active',
        ]);

        $response = $this->deleteJson('/api/students/'.$student->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('students', [
            'id' => $student->id,
        ]);
    }
}
