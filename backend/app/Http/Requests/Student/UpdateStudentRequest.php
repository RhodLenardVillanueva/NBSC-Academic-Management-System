<?php

namespace App\Http\Requests\Student;

// File: backend/app/Http/Requests/Student/UpdateStudentRequest.php

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string|\Illuminate\Validation\Rules\In>>
     */
    public function rules(): array
    {
        $studentId = $this->route('student')?->id;
        $programRules = ['nullable', 'integer'];

        if (Schema::hasTable('programs')) {
            $programRules[] = 'exists:programs,id';
        }

        return [
            'student_number' => ['sometimes', 'string', 'max:50', Rule::unique('students', 'student_number')->ignore($studentId)],
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'program_id' => $programRules,
            'year_level' => ['sometimes', 'integer', 'min:1', 'max:10'],
            'status' => ['sometimes', Rule::in(['active', 'dropped', 'graduated'])],
        ];
    }
}
