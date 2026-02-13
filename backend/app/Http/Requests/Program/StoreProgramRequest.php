<?php

namespace App\Http\Requests\Program;

// File: backend/app/Http/Requests/Program/StoreProgramRequest.php

use Illuminate\Foundation\Http\FormRequest;

class StoreProgramRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:50', 'unique:programs,code'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }
}