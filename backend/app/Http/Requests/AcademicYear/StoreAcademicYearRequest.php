<?php

namespace App\Http\Requests\AcademicYear;

// File: backend/app/Http/Requests/AcademicYear/StoreAcademicYearRequest.php

use Illuminate\Foundation\Http\FormRequest;

class StoreAcademicYearRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:20', 'unique:academic_years,name'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}