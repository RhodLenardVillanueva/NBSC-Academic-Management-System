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
            'add_drop_start' => ['sometimes', 'date', 'required_with:add_drop_end'],
            'add_drop_end' => ['sometimes', 'date', 'required_with:add_drop_start', 'after_or_equal:add_drop_start'],
        ];
    }
}
