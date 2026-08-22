<?php

namespace App\Domain\Contract\Http\Resources;

use App\Domain\Property\Http\Resources\UnitResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'type' => $this->type ?? 'residential',
            'date' => $this->date,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'due_date' => $this->due_date,
            'rent_amount' => $this->rent_amount,
            'lease_term' => $this->lease_term,
            'security_deposit' => $this->security_deposit,
            'deposit_type' => $this->deposit_type,
            'dewa_deposit' => $this->dewa_deposit,
            'due' => $this->due,
            'on_case' => $this->on_case,
            'notes' => $this->notes,
            'unit' => new UnitResource($this->whenLoaded('unit')),
            'tenant' => $this->whenLoaded('tenant'),
            'owner' => $this->whenLoaded('owner'),
            'created_at' => $this->created_at,
        ];
    }
}