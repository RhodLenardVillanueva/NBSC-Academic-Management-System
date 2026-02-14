<?php

namespace App\Http\Requests\EnrollmentSubject;

// File: backend/app/Http/Requests/EnrollmentSubject/UpdateEnrollmentSubjectGradeRequest.php

use Illuminate\Foundation\Http\FormRequest;

class UpdateEnrollmentSubjectGradeRequest extends FormRequest
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
            'quizzes' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'projects' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'participation' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'major_exams' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
