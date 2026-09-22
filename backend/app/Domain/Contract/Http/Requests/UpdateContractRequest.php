<?php

namespace App\Domain\Contract\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && in_array($user->role, ['admin', 'owner', 'cashier', 'accountant'], true);
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
            'tenant_name'      => 'nullable|string|max:255',
            'tenant_email'     => 'nullable|email|max:255',
            'tenant_address'   => 'nullable|string|max:500',
            'tenant_contact'   => 'nullable|string|max:255',
        ];
    }
}