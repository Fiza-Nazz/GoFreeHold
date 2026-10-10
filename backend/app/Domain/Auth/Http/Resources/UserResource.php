<?php

namespace App\Domain\Auth\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'           => $this->role,
            'account_status' => $this->account_status,
            'organization_id'=> $this->organization_id,
            'organization'   => $this->organization ? [
                'id'     => $this->organization->id,
                'name'   => $this->organization->name,
                'status' => $this->organization->status,
            ] : null,
            'impersonation'  => null,
            'owner_scope_id' => $this->role === 'owner' ? $this->owner()->value('id') : $this->staffMembership()->value('owner_id'),
            'permissions'    => app(\App\Domain\Auth\Services\OwnerContextResolver::class)->permissions($this->resource),
            'created_at'     => $this->created_at,
            'updated_at'     => $this->updated_at,
        ];
    }
}
