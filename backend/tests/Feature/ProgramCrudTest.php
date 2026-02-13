<?php

namespace Tests\Feature;

// File: backend/tests/Feature/ProgramCrudTest.php

use App\Models\Program;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProgramCrudTest extends TestCase
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

    public function test_can_list_programs(): void
    {
        $this->authenticateAdmin();

        Program::factory()->count(2)->create();

        $response = $this->getJson('/api/programs');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.data');
    }

    public function test_can_create_program(): void
    {
        $this->authenticateAdmin();

        $payload = Program::factory()->make([
            'code' => 'BSA',
            'name' => 'BS Accountancy',
            'description' => 'Accountancy program.',
        ])->toArray();

        $response = $this->postJson('/api/programs', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'BSA');

        $this->assertDatabaseHas('programs', [
            'code' => 'BSA',
            'name' => 'BS Accountancy',
        ]);
    }

    public function test_can_show_program(): void
    {
        $this->authenticateAdmin();

        $program = Program::factory()->create([
            'code' => 'BSBA',
        ]);

        $response = $this->getJson('/api/programs/'.$program->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'BSBA');
    }

    public function test_can_update_program(): void
    {
        $this->authenticateAdmin();

        $program = Program::factory()->create([
            'code' => 'BSED',
            'name' => 'BS Education',
        ]);

        $payload = [
            'name' => 'BS Secondary Education',
        ];

        $response = $this->putJson('/api/programs/'.$program->id, $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'BS Secondary Education');

        $this->assertDatabaseHas('programs', [
            'id' => $program->id,
            'name' => 'BS Secondary Education',
        ]);
    }

    public function test_can_delete_program(): void
    {
        $this->authenticateAdmin();

        $program = Program::factory()->create([
            'code' => 'BSE',
        ]);

        $response = $this->deleteJson('/api/programs/'.$program->id);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('programs', [
            'id' => $program->id,
        ]);
    }
}
