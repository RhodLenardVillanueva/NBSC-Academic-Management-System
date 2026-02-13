<?php

namespace App\Http\Requests\Enrollment;

// File: backend/app/Http/Requests/Enrollment/UpdateEnrollmentRequest.php

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEnrollmentRequest extends FormRequest
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
        $enrollmentId = $this->route('enrollment')?->id;

        return [
            'student_id' => ['sometimes', 'integer', 'exists:students,id'],
            'program_id' => ['sometimes', 'integer', 'exists:programs,id'],
            'academic_year_id' => ['sometimes', 'integer', 'exists:academic_years,id'],
            'semester_id' => ['sometimes', 'integer', 'exists:semesters,id'],
            'year_level' => ['sometimes', 'integer', 'min:1', 'max:10'],
            'total_units' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', Rule::in(['enrolled', 'cancelled', 'completed'])],
            'unique_enrollment' => [
                Rule::unique('enrollments', 'student_id')
                    ->where(fn ($query) => $query
                        ->where('academic_year_id', $this->input('academic_year_id', $this->route('enrollment')?->academic_year_id))
                        ->where('semester_id', $this->input('semester_id', $this->route('enrollment')?->semester_id))
                    )
                    ->ignore($enrollmentId),
            ],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'unique_enrollment' => $this->input('student_id', $this->route('enrollment')?->student_id),
        ]);
    }
}