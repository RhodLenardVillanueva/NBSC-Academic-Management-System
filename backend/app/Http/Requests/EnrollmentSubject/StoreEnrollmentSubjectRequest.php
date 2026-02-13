<?php

namespace App\Http\Requests\EnrollmentSubject;

// File: backend/app/Http/Requests/EnrollmentSubject/StoreEnrollmentSubjectRequest.php

use App\Models\CourseOffering;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnrollmentSubjectRequest extends FormRequest
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
            'enrollment_id' => ['required', 'integer', 'exists:enrollments,id'],
            'course_offering_id' => ['required', 'integer', 'exists:course_offerings,id'],
            'quiz_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'case_study_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'participation_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'major_exam_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'unique_enrollment_subject' => [
                Rule::unique('enrollment_subjects', 'enrollment_id')
                    ->where(fn ($query) => $query->where('course_offering_id', $this->input('course_offering_id'))),
            ],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $courseOfferingId = $this->input('course_offering_id');

            if (! $courseOfferingId) {
                return;
            }

            $courseOffering = CourseOffering::find($courseOfferingId);

            if ($courseOffering && $courseOffering->slots_taken >= $courseOffering->max_slots) {
                $validator->errors()->add('course_offering_id', 'Course offering is full.');
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'unique_enrollment_subject' => $this->input('enrollment_id'),
        ]);
    }
}