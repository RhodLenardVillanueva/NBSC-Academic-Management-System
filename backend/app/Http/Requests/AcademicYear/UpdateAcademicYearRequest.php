<?php

namespace App\Http\Requests\AcademicYear;

// File: backend/app/Http/Requests/AcademicYear/UpdateAcademicYearRequest.php

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAcademicYearRequest extends FormRequest
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
        $academicYearId = $this->route('academic_year')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:20', Rule::unique('academic_years', 'name')->ignore($academicYearId)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}