<?php

namespace Tests\Feature;

// File: backend/tests/Feature/AuthFlowTest.php

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_auth_flow_login_whoami_logout(): void
    {
        $this->seed(RoleSeeder::class);

        $adminRole = Role::where('name', 'Admin')->first();

        $this->assertNotNull($adminRole);

        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $user->roles()->syncWithoutDetaching([$adminRole->id]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('data.token');

        $this->assertNotEmpty($token);

        $whoamiResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/whoami');

        $whoamiResponse->assertStatus(200);

        $logoutResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/logout');

        $logoutResponse->assertStatus(200);

        [$tokenId] = explode('|', $token, 2);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);

        Auth::forgetGuards();

        $whoamiAfterLogoutResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/whoami');

        $whoamiAfterLogoutResponse->assertStatus(401);
    }

    public function test_user_without_role_is_forbidden_from_role_protected_route(): void
    {
        $user = User::factory()->create([
            'email' => 'norole@example.com',
            'password' => Hash::make('password'),
        ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'norole@example.com',
            'password' => 'password',
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('data.token');

        $this->assertNotEmpty($token);

        $forbiddenResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/students');

        $forbiddenResponse->assertStatus(403);
    }
}