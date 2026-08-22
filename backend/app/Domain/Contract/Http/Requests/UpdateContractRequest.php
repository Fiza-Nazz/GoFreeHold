<?php

namespace App\Domain\Contract\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'date'             => 'sometimes|date',
            'start_date'       => 'sometimes|date',
            'end_date'         => 'sometimes|date|after:start_date',
            'due_date'         => 'nullable|date',
            'rent_amount'      => 'sometimes|numeric|min:0',
            'lease_term'       => 'nullable|string|max:100',
            'security_deposit' => 'sometimes|numeric|min:0',
            'deposit_type'     => 'nullable|string|max:100',
            'dewa_deposit'     => 'nullable|numeric|min:0',
            'due'              => 'nullable|numeric|min:0',
            'on_case'          => 'nullable|boolean',
            'notes'            => 'nullable|string',
        ];
    }
}