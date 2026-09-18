<?php

namespace App\Domain\Property\Services;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Property\Models\BookingCashReceipt;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PropertyService
{
    public function resolveOwnerProfileId(?int $ownerId): ?int
    {
        if ($ownerId && !Owner::whereKey($ownerId)->exists()) {
            throw ValidationException::withMessages(['owner_id' => ['Select a valid owner profile.']]);
        }
        return $ownerId;
    }

    public function createProperty(array $payload): Property
    {
        $payload['owner_id'] = $this->resolveOwnerProfileId($payload['owner_id'] ?? null);

        return Property::create($payload);
    }

    public function updateProperty(Property $property, array $payload): Property
    {
        if (isset($payload['owner_id']) && (int) $payload['owner_id'] !== (int) $property->owner_id && $property->units()->exists()) {
            throw ValidationException::withMessages(['owner_id' => ['Ownership transfer requires review of linked units, contracts and jobs.']]);
        }
        if (array_key_exists('owner_id', $payload)) {
            $payload['owner_id'] = $this->resolveOwnerProfileId($payload['owner_id']);
        }

        $property->update($payload);

        return $property;
    }

    public function syncOwnerProfiles()
    {
        return Owner::query()
            ->select('id', 'name', 'email', 'contact', 'user_id')
            ->orderBy('name')
            ->get();
    }

    public function createUnit(array $payload): Unit
    {
        return DB::transaction(function () use ($payload) {
            $property = Property::lockForUpdate()->findOrFail($payload['property_id']);
            $payload['owner_id'] = $property->owner_id;
            $payload['status'] = $payload['status'] ?? 'AVAILABLE';

            $unit = Unit::create($payload);
            $property->increment('total_units');

            return $unit;
        });
    }

    public function deleteUnit(Unit $unit): void
    {
        DB::transaction(function () use ($unit) {
            $property = Property::lockForUpdate()->find($unit->property_id);
            $unit->delete();

            if ($property) {
                $property->decrement('total_units');
            }
        });
    }

    public function bookUnit(array $payload, ?int $recordedBy): array
    {
        return DB::transaction(function () use ($payload, $recordedBy) {
            $unit = Unit::query()->lockForUpdate()->findOrFail($payload['unit_id']);

            if ($unit->status !== 'AVAILABLE') {
                throw ValidationException::withMessages([
                    'unit_id' => ['Unit is not available for booking.'],
                ]);
            }

            $unit->status = 'BOOKED';
            $unit->save();

            do {
                $receiptNumber = 'REC-' . now()->format('YmdHis') . '-' . random_int(100, 999);
            } while (BookingCashReceipt::where('receipt_number', $receiptNumber)->lockForUpdate()->exists());

            $receipt = BookingCashReceipt::create([
                'unit_id' => $unit->id,
                'receipt_number' => $receiptNumber,
                'tenant_name' => $payload['tenant_name'],
                'amount' => $payload['amount'],
                'receipt_date' => now()->toDateString(),
                'notes' => $payload['notes'] ?? null,
                'recorded_by' => $recordedBy,
            ]);

            return [$unit->fresh(), $receipt];
        });
    }

    public function vacantUnits()
    {
        return Unit::with('property:id,name', 'owner:id,name')
            ->where('status', 'AVAILABLE')
            ->get();
    }

    public function createOwner(array $payload): Owner
    {
        return Owner::create($payload);
    }

    public function updateOwner(Owner $owner, array $payload): Owner
    {
        $owner->update($payload);
        return $owner;
    }

    public function createTenant(array $payload): Tenant
    {
        return Tenant::create($payload);
    }

    public function updateTenant(Tenant $tenant, array $payload): Tenant
    {
        $tenant->update($payload);
        return $tenant->fresh();
    }

    public function deleteTenant(Tenant $tenant): void
    {
        if ($tenant->contracts()->exists()) {
            throw ValidationException::withMessages([
                'tenant' => ['Cannot delete tenant with existing contracts.'],
            ]);
        }

        $tenant->delete();
    }
}
