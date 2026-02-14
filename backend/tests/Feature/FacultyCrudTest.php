<?php

namespace Tests\Feature;

// File: backend/tests/Feature/FacultyCrudTest.php

use App\Models\Instructor;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FacultyCrudTest extends TestCase
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

    public function test_can_list_faculty(): void
    {
        $this->authenticateAdmin();

        Instructor::create([
            'employee_number' => 'EMP-7001',
            'first_name' => 'Iris',
            'last_name' => 'Lopez',
            'email' => 'iris.lopez@example.com',
            'department' => 'Business',
            'status' => 'active',
        ]);

        Instructor::create([
            'employee_number' => 'EMP-7002',
            'first_name' => 'Noel',
            'last_name' => 'Diaz',
            'email' => 'noel.diaz@example.com',
            'department' => 'Marketing',
            'status' => 'inactive',
        ]);

        $response = $this->getJson('/api/faculty');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.data');
    }

    public function test_can_create_faculty(): void
    {
        $this->authenticateAdmin();

        $payload = [
            'employee_number' => 'EMP-7010',
            'first_name' => 'Jessa',
            'last_name' => 'Navarro',
            'email' => 'jessa.navarro@example.com',
            'department' => 'Accounting',
            'status' => 'active',
        ];

        $response = $this->postJson('/api/faculty', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.employee_number', 'EMP-7010');

        $this->assertDatabaseHas('instructors', [
            'employee_number' => 'EMP-7010',
            'email' => 'jessa.navarro@example.com',
        ]);
    }

    public function test_can_show_faculty(): void
    {
        $this->authenticateAdmin();

        $faculty = Instructor::create([
            'employee_number' => 'EMP-7020',
            'first_name' => 'Leo',
            'last_name' => 'Torres',
            'email' => 'leo.torres@example.com',
            'department' => 'Hospitality',
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/faculty/'.$faculty->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.employee_number', 'EMP-7020');
    }

    public function test_can_update_faculty(): void
    {
        $this->authenticateAdmin();

        $faculty = Instructor::create([
            'employee_number' => 'EMP-7030',
            'first_name' => 'Rina',
            'last_name' => 'Santos',
            'email' => 'rina.santos@example.com',
            'department' => 'Nursing',
            'status' => 'active',
        ]);

        $payload = [
            'department' => 'Health Sciences',
            'status' => 'inactive',
        ];

        $response = $this->putJson('/api/faculty/'.$faculty->id, $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.department', 'Health Sciences')
            ->assertJsonPath('data.status', 'inactive');

        $this->assertDatabaseHas('instructors', [
            'id' => $faculty->id,
            'department' => 'Health Sciences',
            'status' => 'inactive',
        ]);
    }

    public function test_can_delete_faculty(): void
    {
        $this->authenticateAdmin();

        $faculty = Instructor::create([
            'employee_number' => 'EMP-7040',
            'first_name' => 'Maya',
            'last_name' => 'Reyes',
            'email' => 'maya.reyes@example.com',
            'department' => 'Education',
            'status' => 'active',
        ]);

        $response = $this->deleteJson('/api/faculty/'.$faculty->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('instructors', [
            'id' => $faculty->id,
        ]);
    }
}
