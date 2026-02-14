<?php

namespace Tests\Feature;

// File: backend/tests/Feature/SemesterCrudTest.php

use App\Models\AcademicYear;
use App\Models\Role;
use App\Models\Semester;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SemesterCrudTest extends TestCase
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

    public function test_can_list_semesters(): void
    {
        $this->authenticateAdmin();

        $academicYear = AcademicYear::create([
            'name' => '2025-2026',
            'is_active' => true,
        ]);

        Semester::create([
            'academic_year_id' => $academicYear->id,
            'name' => '1st Semester',
            'is_current' => true,
        ]);

        Semester::create([
            'academic_year_id' => $academicYear->id,
            'name' => '2nd Semester',
            'is_current' => false,
        ]);

        $response = $this->getJson('/api/semesters');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.data');
    }

    public function test_can_create_semester(): void
    {
        $this->authenticateAdmin();

        $academicYear = AcademicYear::create([
            'name' => '2026-2027',
            'is_active' => true,
        ]);

        $payload = [
            'academic_year_id' => $academicYear->id,
            'name' => '1st Semester',
            'is_current' => true,
            'add_drop_start' => '2026-06-01',
            'add_drop_end' => '2026-06-15',
        ];

        $response = $this->postJson('/api/semesters', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', '1st Semester');

        $this->assertDatabaseHas('semesters', [
            'academic_year_id' => $academicYear->id,
            'name' => '1st Semester',
            'is_current' => 1,
        ]);
    }

    public function test_can_show_semester(): void
    {
        $this->authenticateAdmin();

        $academicYear = AcademicYear::create([
            'name' => '2027-2028',
            'is_active' => false,
        ]);

        $semester = Semester::create([
            'academic_year_id' => $academicYear->id,
            'name' => '2nd Semester',
            'is_current' => false,
        ]);

        $response = $this->getJson('/api/semesters/'.$semester->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', '2nd Semester');
    }

    public function test_can_update_semester(): void
    {
        $this->authenticateAdmin();

        $academicYear = AcademicYear::create([
            'name' => '2028-2029',
            'is_active' => false,
        ]);

        $semester = Semester::create([
            'academic_year_id' => $academicYear->id,
            'name' => '1st Semester',
            'is_current' => false,
        ]);

        $payload = [
            'is_current' => true,
        ];

        $response = $this->putJson('/api/semesters/'.$semester->id, $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_current', true);

        $this->assertDatabaseHas('semesters', [
            'id' => $semester->id,
            'is_current' => 1,
        ]);
    }

    public function test_can_delete_semester(): void
    {
        $this->authenticateAdmin();

        $academicYear = AcademicYear::create([
            'name' => '2029-2030',
            'is_active' => false,
        ]);

        $semester = Semester::create([
            'academic_year_id' => $academicYear->id,
            'name' => '2nd Semester',
            'is_current' => false,
        ]);

        $response = $this->deleteJson('/api/semesters/'.$semester->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('semesters', [
            'id' => $semester->id,
        ]);
    }
}
