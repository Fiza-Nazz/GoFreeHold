<?php

namespace App\Domain\Property\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'property_id'   => $this->property_id,
            'number'        => $this->number,
            'dhewa_no'      => $this->dhewa_no,
            'category'      => $this->category,
            'floor'         => $this->floor,
            'type'          => $this->type,
            'size'          => $this->size,
            'furnished'     => $this->furnished,
            'price'         => $this->price,
            'status'        => $this->status,
            'property_name' => $this->whenLoaded('property', fn () => $this->property->name),
        ];
    }
}
