<?php

namespace App\Domain\Auth\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email'       => 'required|string|email',
            'password'    => 'required|string',
            'remember_me' => 'sometimes|boolean',
        ];
    }
}
