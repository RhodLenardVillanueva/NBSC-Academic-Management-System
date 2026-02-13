<?php

namespace App\Http\Requests\Enrollment;

// File: backend/app/Http/Requests/Enrollment/StoreEnrollmentRequest.php

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string|\Illuminate\Validation\Rules\In|\Illuminate\Validation\Rules\Unique>>
     */
    public function rules(): array
    {
        return [
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'program_id' => ['required', 'integer', 'exists:programs,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'semester_id' => ['required', 'integer', 'exists:semesters,id'],
            'year_level' => ['required', 'integer', 'min:1', 'max:10'],
            'total_units' => ['sometimes', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['enrolled', 'cancelled', 'completed'])],
            'unique_enrollment' => [
                Rule::unique('enrollments', 'student_id')
                    ->where(fn ($query) => $query
                        ->where('academic_year_id', $this->input('academic_year_id'))
                        ->where('semester_id', $this->input('semester_id'))
                    ),
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'unique_enrollment' => $this->input('student_id'),
        ]);
    }
}