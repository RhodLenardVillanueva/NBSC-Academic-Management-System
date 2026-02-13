<?php

namespace App\Http\Requests\Subject;

// File: backend/app/Http/Requests/Subject/StoreSubjectRequest.php

use Illuminate\Foundation\Http\FormRequest;

class StoreSubjectRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:20', 'unique:subjects,code'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'units' => ['required', 'integer', 'min:1', 'max:10'],
            'lecture_hours' => ['sometimes', 'integer', 'min:0'],
            'lab_hours' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}