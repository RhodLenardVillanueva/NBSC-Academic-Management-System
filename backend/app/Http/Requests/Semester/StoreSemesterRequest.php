<?php

namespace App\Http\Requests\Semester;

// File: backend/app/Http/Requests/Semester/StoreSemesterRequest.php

use Illuminate\Foundation\Http\FormRequest;

class StoreSemesterRequest extends FormRequest
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
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'name' => ['required', 'string', 'max:50'],
            'is_current' => ['sometimes', 'boolean'],
        ];
    }
}