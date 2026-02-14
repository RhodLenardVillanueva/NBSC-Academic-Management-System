<?php

namespace App\Http\Requests\Assessment;

// File: backend/app/Http/Requests/Assessment/StoreAssessmentInstallmentsRequest.php

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssessmentInstallmentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string|\Illuminate\Validation\Rules\In>>
     */
    public function rules(): array
    {
        return [
            'plan_type' => ['required', Rule::in(['full', 'custom', 'default'])],
            'due_date' => ['required_if:plan_type,full', 'date'],
            'description' => ['nullable', 'string', 'max:255'],
            'installments' => ['required_if:plan_type,custom', 'array', 'min:1'],
            'installments.*.due_date' => ['required_with:installments', 'date'],
            'installments.*.description' => ['required_with:installments', 'string', 'max:255'],
            'installments.*.amount' => ['required_with:installments', 'numeric', 'min:0.01'],
            'start_date' => ['required_if:plan_type,default', 'date'],
            'interval_days' => ['sometimes', 'integer', 'min:1', 'max:365'],
        ];
    }
}
