<?php

namespace Database\Seeders;

// File: backend/database/seeders/RoleSeeder.php

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $roles = [
            'Admin',
            'Registrar',
            'Faculty',
            'Student',
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
    }
}