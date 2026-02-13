<?php

namespace Database\Factories;

// File: backend/database/factories/ProgramFactory.php

use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProgramFactory extends Factory
{
    protected $model = Program::class;

    public function definition(): array
    {
        $codePrefix = $this->faker->randomElement(['BSIT', 'BSCS', 'BSA', 'BSBA', 'BSED', 'BSE', 'BSN']);
        $codeSuffix = str_pad((string) $this->faker->unique()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT);

        return [
            'code' => $codePrefix.'-'.$codeSuffix,
            'name' => $this->faker->randomElement([
                'BS Information Technology',
                'BS Computer Science',
                'BS Accountancy',
                'BS Business Administration',
                'BS Secondary Education',
                'BS Engineering',
                'BS Nursing',
            ]),
            'description' => $this->faker->optional()->sentence(),
        ];
    }
}