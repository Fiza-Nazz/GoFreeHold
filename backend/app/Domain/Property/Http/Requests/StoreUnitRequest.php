<?php

namespace App\Domain\Property\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'number'      => 'required|string|max:50',
            'dhewa_no'    => 'nullable|string|max:100',
            'category'    => 'nullable|string|max:100',
            'floor'       => 'required|integer',
            'type'        => 'required|string|max:50',
            'size'        => 'required|numeric|min:0',
            'furnished'   => 'nullable|boolean',
            'price'       => 'required|numeric|min:0',
            'status'      => 'nullable|in:AVAILABLE,BOOKED,OCCUPIED,SOLD',
        ];
    }
}
