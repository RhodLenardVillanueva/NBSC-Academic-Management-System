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
            'enrollment_id' => ['sometimes', 'integer', 'exists:enrollments,id'],
            'course_offering_id' => ['sometimes', 'integer', 'exists:course_offerings,id'],
        ];
    }
}
