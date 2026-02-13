<?php

namespace App\Http\Requests\EnrollmentSubject;

// File: backend/app/Http/Requests/EnrollmentSubject/UpdateEnrollmentSubjectRequest.php

use Illuminate\Foundation\Http\FormRequest;

class UpdateEnrollmentSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'quiz_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'case_study_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'participation_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'major_exam_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grade_description' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}