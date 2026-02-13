<?php

namespace Database\Seeders;

// File: backend/database/seeders/DatabaseSeeder.php

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        // User::factory(10)->create();

        $user = User::firstOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'password' => 'password',
        ]);

        $adminRole = Role::where('name', 'Admin')->first();

        if ($adminRole !== null) {
            $user->roles()->syncWithoutDetaching([$adminRole->id]);
        }
    }
}