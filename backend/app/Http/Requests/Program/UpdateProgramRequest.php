<?php

namespace App\Http\Requests\Program;

// File: backend/app/Http/Requests/Program/UpdateProgramRequest.php

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProgramRequest extends FormRequest
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
        $programId = $this->route('program')?->id;

        return [
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('programs', 'code')->ignore($programId)],
            'name' => ['sometimes', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }
}