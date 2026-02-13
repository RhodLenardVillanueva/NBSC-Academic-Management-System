<?php

namespace Database\Factories;

// File: backend/database/factories/StudentFactory.php

use App\Models\Program;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        $year = $this->faker->numberBetween(2020, 2026);
        $sequence = str_pad((string) $this->faker->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT);
        $programId = Program::query()->inRandomOrder()->value('id');

        return [
            'student_number' => $year.'-'.$sequence,
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'program_id' => $programId,
            'year_level' => $this->faker->numberBetween(1, 4),
            'status' => $this->faker->randomElement(['active', 'dropped', 'graduated']),
        ];
    }
}