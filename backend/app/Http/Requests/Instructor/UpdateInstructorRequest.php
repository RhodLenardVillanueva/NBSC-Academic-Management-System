<?php

namespace App\Http\Requests\Instructor;

// File: backend/app/Http/Requests/Instructor/UpdateInstructorRequest.php

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInstructorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string|\Illuminate\Validation\Rules\Unique>>
     */
    public function rules(): array
    {
        $instructorId = $this->route('instructor')?->id;

        return [
            'employee_number' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('instructors', 'employee_number')->ignore($instructorId),
            ],
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:150',
                Rule::unique('instructors', 'email')->ignore($instructorId),
            ],
            'department' => ['sometimes', 'string', 'max:100'],
            'status' => ['sometimes', 'string', 'in:active,inactive'],
        ];
    }
}
