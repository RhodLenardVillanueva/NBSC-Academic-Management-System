<?php

namespace App\Http\Requests\CourseOffering;

// File: backend/app/Http/Requests/CourseOffering/StoreCourseOfferingRequest.php

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseOfferingRequest extends FormRequest
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
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'semester_id' => ['required', 'integer', 'exists:semesters,id'],
            'section' => ['required', 'string', 'max:20'],
            'schedule' => ['nullable', 'string'],
            'room' => ['nullable', 'string'],
            'max_slots' => ['sometimes', 'integer', 'min:1'],
            'slots_taken' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}