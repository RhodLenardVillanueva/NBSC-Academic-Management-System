<?php

namespace App\Http\Requests\Subject;

// File: backend/app/Http/Requests/Subject/UpdateSubjectRequest.php

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubjectRequest extends FormRequest
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
        $subjectId = $this->route('subject')?->id;

        return [
            'code' => ['sometimes', 'string', 'max:20', Rule::unique('subjects', 'code')->ignore($subjectId)],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'units' => ['sometimes', 'integer', 'min:1', 'max:10'],
            'lecture_hours' => ['sometimes', 'integer', 'min:0'],
            'lab_hours' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}