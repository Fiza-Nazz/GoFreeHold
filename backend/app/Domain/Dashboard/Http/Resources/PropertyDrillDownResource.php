<?php

namespace App\Domain\Dashboard\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyDrillDownResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'address'         => $this->address,
            'city'            => $this->city,
            'type'            => $this->type,
            'description'     => $this->description,
            'total_units'     => (int) ($this->total_units ?? 0),
            'occupied_units'  => (int) ($this->occupied_units ?? 0),
            'vacant_units'    => (int) ($this->vacant_units ?? 0),
        ];
    }
}
