<?php

namespace App\Http\Requests\Student;

// File: backend/app/Http/Requests/Student/StoreStudentRequest.php

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
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
        $programRules = ['nullable', 'integer'];

        if (Schema::hasTable('programs')) {
            $programRules[] = 'exists:programs,id';
        }

        return [
            'student_number' => ['required', 'string', 'max:50', 'unique:students,student_number'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'program_id' => $programRules,
            'year_level' => ['required', 'integer', 'min:1', 'max:10'],
            'status' => ['required', Rule::in(['active', 'dropped', 'graduated'])],
        ];
    }
}
