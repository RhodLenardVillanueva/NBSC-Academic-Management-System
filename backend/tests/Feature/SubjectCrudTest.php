<?php

namespace Tests\Feature;

// File: backend/tests/Feature/SubjectCrudTest.php

use App\Models\Role;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SubjectCrudTest extends TestCase
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

    public function test_can_list_subjects(): void
    {
        $this->authenticateAdmin();

        Subject::create([
            'code' => 'MATH101',
            'title' => 'College Algebra',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        Subject::create([
            'code' => 'ENG102',
            'title' => 'Speech Communication',
            'description' => 'Public speaking fundamentals.',
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/subjects');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.data');
    }

    public function test_can_create_subject(): void
    {
        $this->authenticateAdmin();

        $payload = [
            'code' => 'CS201',
            'title' => 'Data Structures',
            'description' => 'Core data structures and algorithms.',
            'units' => 4,
            'lecture_hours' => 3,
            'lab_hours' => 1,
            'is_active' => true,
        ];

        $response = $this->postJson('/api/subjects', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'CS201');

        $this->assertDatabaseHas('subjects', [
            'code' => 'CS201',
            'title' => 'Data Structures',
        ]);
    }

    public function test_can_show_subject(): void
    {
        $this->authenticateAdmin();

        $subject = Subject::create([
            'code' => 'HIST101',
            'title' => 'Philippine History',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/subjects/'.$subject->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'HIST101');
    }

    public function test_can_update_subject(): void
    {
        $this->authenticateAdmin();

        $subject = Subject::create([
            'code' => 'SCI101',
            'title' => 'General Science',
            'description' => null,
            'units' => 3,
            'lecture_hours' => 3,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $payload = [
            'title' => 'General Science I',
            'units' => 4,
        ];

        $response = $this->putJson('/api/subjects/'.$subject->id, $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'General Science I');

        $this->assertDatabaseHas('subjects', [
            'id' => $subject->id,
            'title' => 'General Science I',
            'units' => 4,
        ]);
    }

    public function test_can_delete_subject(): void
    {
        $this->authenticateAdmin();

        $subject = Subject::create([
            'code' => 'PE101',
            'title' => 'Physical Education',
            'description' => null,
            'units' => 2,
            'lecture_hours' => 2,
            'lab_hours' => 0,
            'is_active' => true,
        ]);

        $response = $this->deleteJson('/api/subjects/'.$subject->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('subjects', [
            'id' => $subject->id,
        ]);
    }
}