<?php

namespace Tests\Feature;

// File: backend/tests/Feature/AcademicYearCrudTest.php

use App\Models\AcademicYear;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AcademicYearCrudTest extends TestCase
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

    public function test_can_list_academic_years(): void
    {
        $this->authenticateAdmin();

        AcademicYear::create([
            'name' => '2024-2025',
            'is_active' => false,
        ]);

        AcademicYear::create([
            'name' => '2025-2026',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/academic-years');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.data');
    }

    public function test_can_create_academic_year(): void
    {
        $this->authenticateAdmin();

        $payload = [
            'name' => '2026-2027',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/academic-years', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', '2026-2027');

        $this->assertDatabaseHas('academic_years', [
            'name' => '2026-2027',
            'is_active' => 1,
        ]);
    }

    public function test_can_show_academic_year(): void
    {
        $this->authenticateAdmin();

        $academicYear = AcademicYear::create([
            'name' => '2027-2028',
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/academic-years/'.$academicYear->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', '2027-2028');
    }

    public function test_can_update_academic_year(): void
    {
        $this->authenticateAdmin();

        $academicYear = AcademicYear::create([
            'name' => '2028-2029',
            'is_active' => false,
        ]);

        $payload = [
            'is_active' => true,
        ];

        $response = $this->putJson('/api/academic-years/'.$academicYear->id, $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('academic_years', [
            'id' => $academicYear->id,
            'is_active' => 1,
        ]);
    }

    public function test_can_delete_academic_year(): void
    {
        $this->authenticateAdmin();

        $academicYear = AcademicYear::create([
            'name' => '2029-2030',
            'is_active' => false,
        ]);

        $response = $this->deleteJson('/api/academic-years/'.$academicYear->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('academic_years', [
            'id' => $academicYear->id,
        ]);
    }
}