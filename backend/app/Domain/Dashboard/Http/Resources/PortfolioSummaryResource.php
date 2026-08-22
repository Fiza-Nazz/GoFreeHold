<?php

namespace App\Domain\Dashboard\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'total_properties' => (int) $this->resource['total_properties'],
            'total_units'      => (int) $this->resource['total_units'],
            'occupied_units'   => (int) $this->resource['occupied_units'],
            'vacant_units'     => (int) $this->resource['vacant_units'],
            'booked_units'     => (int) $this->resource['booked_units'],
        ];
    }
}
