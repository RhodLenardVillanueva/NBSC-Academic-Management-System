<?php

namespace App\Http\Requests\Semester;

// File: backend/app/Http/Requests/Semester/UpdateSemesterRequest.php

use Illuminate\Foundation\Http\FormRequest;

class UpdateSemesterRequest extends FormRequest
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
            'academic_year_id' => ['sometimes', 'integer', 'exists:academic_years,id'],
            'name' => ['sometimes', 'string', 'max:50'],
            'is_current' => ['sometimes', 'boolean'],
        ];
    }
}