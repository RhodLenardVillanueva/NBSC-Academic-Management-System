<?php

namespace App\Http\Requests\Assessment;

// File: backend/app/Http/Requests/Assessment/StorePaymentRequest.php

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
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
            'amount' => ['required', 'numeric', 'min:0.01'],
            'paid_at' => ['required', 'date'],
            'receipt_number' => ['required', 'string', 'max:100'],
            'cashier_id' => ['sometimes', 'integer', 'exists:users,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('cashier_id') && $this->user()) {
            $this->merge([
                'cashier_id' => $this->user()->id,
            ]);
        }
    }
}
