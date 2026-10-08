<?php

namespace App\Domain\Dashboard\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UnitDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'property_id' => $this->property_id,
            'owner_id'    => $this->owner_id,
            'number'      => $this->number,
            'dhewa_no'    => $this->dhewa_no,
            'category'    => $this->category,
            'type'        => $this->type,
            'floor'       => $this->floor,
            'size'        => $this->size,
            'furnished'   => (bool) $this->furnished,
            'price'                  => $this->price,
            'monthly_service_charge' => $this->monthly_service_charge,
            'status'                 => $this->status,
            'image'                  => $this->image,
            'image_url'              => $this->image_url,
            'property'    => $this->whenLoaded('property', function () {
                return [
                    'id'      => $this->property->id,
                    'name'    => $this->property->name,
                    'address' => $this->property->address,
                    'city'    => $this->property->city,
                ];
            }),
        ];
    }
}
