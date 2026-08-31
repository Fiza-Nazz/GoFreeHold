<?php

namespace App\Domain\Contract\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'unit_id'          => [
                'required',
                'exists:units,id',
                function ($attribute, $value, $fail) {
                    $unit = \App\Domain\Property\Models\Unit::find($value);
                    if ($unit && $unit->status === 'OCCUPIED') {
                        $fail('The selected unit is already occupied.');
                    }
                },
            ],
            'tenant_id'              => 'nullable|exists:tenants,id|required_without:tenant_name',
            'tenant_name'            => 'nullable|string|max:255|required_without:tenant_id',
            'tenant_email'           => 'nullable|email|max:255',
            'tenant_phone'           => 'nullable|string|max:50',
            'tenant_emirates_id'     => 'nullable|string|max:50',
            'tenant_nationality'     => 'nullable|string|max:100',
            'tenant_passport_number' => 'nullable|string|max:100',
            'tenant_address'         => 'nullable|string|max:500',
            'owner_id'               => 'required|exists:owners,id',
            'date'                   => 'nullable|date',
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after:start_date',
            'due_date'         => 'nullable|date',
            'rent_amount'      => 'required|numeric|min:0',
            'lease_term'       => 'nullable|string|max:100',
            'security_deposit' => 'required|numeric|min:0',
            'deposit_type'     => 'nullable|string|max:100',
            'dewa_deposit'     => 'nullable|numeric|min:0',
            'due'              => 'nullable|numeric|min:0',
            'on_case'          => 'nullable|boolean',
            'tenant_id_image'  => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:4096',
            'owner_id_image'   => 'nullable|string|max:500',
            'type'             => 'required|in:residential,commercial,industrial',
            'notes'            => 'nullable|string',
            'mode_of_payment'      => 'required|string|max:100',
            'contract_value'       => 'nullable|numeric|min:0',
            'discount_type'        => 'nullable|string|max:100',
            'discount_info'        => 'nullable|string',
            'passport_image'       => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:4096',
            'visa_page'            => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:4096',
            'tenant_id_back_image' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:4096',
        ];
    }
}