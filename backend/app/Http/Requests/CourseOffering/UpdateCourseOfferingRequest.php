<?php

namespace App\Http\Requests\CourseOffering;

// File: backend/app/Http/Requests/CourseOffering/UpdateCourseOfferingRequest.php

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseOfferingRequest extends FormRequest
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
            'subject_id' => ['sometimes', 'integer', 'exists:subjects,id'],
            'academic_year_id' => ['sometimes', 'integer', 'exists:academic_years,id'],
            'semester_id' => ['sometimes', 'integer', 'exists:semesters,id'],
            'section' => ['sometimes', 'string', 'max:20'],
            'schedule' => ['nullable', 'string'],
            'room' => ['nullable', 'string'],
            'max_slots' => ['sometimes', 'integer', 'min:1'],
            'slots_taken' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}