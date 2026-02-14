<?php

namespace App\Http\Requests\Assessment;

// File: backend/app/Http/Requests/Assessment/StoreAssessmentRequest.php

use Illuminate\Foundation\Http\FormRequest;

class StoreAssessmentRequest extends FormRequest
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
            'tuition_amount' => ['required', 'numeric', 'min:0'],
            'miscellaneous_amount' => ['required', 'numeric', 'min:0'],
            'other_fees_amount' => ['required', 'numeric', 'min:0'],
            'discount_amount' => ['required', 'numeric', 'min:0'],
            'adjustments' => ['sometimes', 'array'],
            'adjustments.*.description' => ['required_with:adjustments', 'string', 'max:255'],
            'adjustments.*.amount' => ['required_with:adjustments', 'numeric'],
        ];
    }
}
