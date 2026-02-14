<?php

namespace App\Http\Requests\Instructor;

// File: backend/app/Http/Requests/Instructor/StoreInstructorRequest.php

use Illuminate\Foundation\Http\FormRequest;

class StoreInstructorRequest extends FormRequest
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
            'employee_number' => ['required', 'string', 'max:50', 'unique:instructors,employee_number'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'string', 'email', 'max:150', 'unique:instructors,email'],
            'department' => ['required', 'string', 'max:100'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ];
    }
}
