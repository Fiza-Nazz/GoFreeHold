<?php

namespace App\Domain\Contract\Http\Requests;

use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Property\Models\Unit;
use Illuminate\Foundation\Http\FormRequest;

class StorePreparedContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && in_array($user->role, ['admin', 'owner', 'cashier', 'accountant'], true);
    }

    protected function prepareForValidation(): void
    {
        $user = $this->user();

        // 1. Resolve owner_id for owner staff / owner role
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(OwnerContextResolver::class)->ownerId($user);
            if (! $this->filled('owner_id')) {
                $this->merge(['owner_id' => $ownerId]);
            }
        } elseif (! $this->filled('owner_id') && $this->filled('unit_id')) {
            $unit = Unit::find($this->input('unit_id'));
            if ($unit) {
                $unitOwnerId = $unit->owner_id ?: $unit->property?->owner_id;
                if ($unitOwnerId) {
                    $this->merge(['owner_id' => $unitOwnerId]);
                }
            }
        }

        // 2. Default status to draft
        if (! $this->filled('status')) {
            $this->merge(['status' => 'draft']);
        }

        // 3. Decode JSON strings from multipart/form-data payloads
        if ($this->has('addendum_terms') && is_string($this->input('addendum_terms'))) {
            $decoded = json_decode($this->input('addendum_terms'), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['addendum_terms' => $decoded]);
            }
        }

        if ($this->has('pdc_cheques') && is_string($this->input('pdc_cheques'))) {
            $decoded = json_decode($this->input('pdc_cheques'), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['pdc_cheques' => $decoded]);
            }
        }

        if ($this->has('new_tenant_details') && is_string($this->input('new_tenant_details'))) {
            $decoded = json_decode($this->input('new_tenant_details'), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['new_tenant_details' => $decoded]);
            }
        }

        if ($this->has('tenant_documents') && is_string($this->input('tenant_documents'))) {
            $decoded = json_decode($this->input('tenant_documents'), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['tenant_documents' => $decoded]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'unit_id'                => 'required|exists:units,id',
            'tenant_id'              => 'nullable|exists:tenants,id',
            'owner_id'               => 'nullable|exists:owners,id',
            'start_date'             => 'required|date',
            'end_date'               => 'required|date',
            'rent_amount'            => 'required|numeric|min:0',
            'contract_value'         => 'nullable|numeric|min:0',
            'security_deposit'       => 'nullable|numeric|min:0',
            'lease_term'             => 'nullable|string|max:100',
            'payment_frequency'      => 'nullable|string|max:100',
            'mode_of_payment'        => 'nullable|string|max:100',
            'number_of_cheques'      => 'nullable|integer|min:0|max:100',
            'notes'                  => 'nullable|string',
            'status'                 => 'nullable|string|max:50',
            'addendum_terms'         => 'nullable|array',
            'pdc_cheques'            => 'nullable|array',
            'new_tenant_details'     => 'nullable|array',
            'tenant_name'            => 'nullable|string|max:255',
            'tenant_email'           => 'nullable|email|max:255',
            'tenant_phone'           => 'nullable|string|max:50',
            'tenant_emirates_id'     => 'nullable|string|max:50',
            'tenant_nationality'     => 'nullable|string|max:100',
            'tenant_passport_number' => 'nullable|string|max:100',
            'tenant_address'         => 'nullable|string|max:500',
            'passport_image'         => 'nullable|file|max:10240',
            'visa_page'              => 'nullable|file|max:10240',
            'tenant_id_image'        => 'nullable|file|max:10240',
            'tenant_id_back_image'   => 'nullable|file|max:10240',
            'tenant_documents'       => 'nullable',
        ];
    }
}
