<?php

namespace App\Domain\Payment\Services;

use App\Domain\Auth\Models\User;
use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Payment\Models\ServiceCharge;
use App\Domain\Payment\Models\ServiceChargeDoc;
use App\Domain\Payment\Models\ServiceChargePayment;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ServiceChargeService
{
    public function __construct(private readonly OwnerContextResolver $contextResolver)
    {
    }

    /**
     * Scope a service charge query by authenticated user's organization / owner membership.
     */
    public function scopeCharges(Builder $query, User $user): Builder
    {
        $this->contextResolver->assertActive($user);

        if ($user->role === 'admin') {
            return $query;
        }

        $ownerId = $this->contextResolver->ownerId($user);
        $orgId = null;
        try {
            $orgId = $this->contextResolver->organizationId($user);
        } catch (\Throwable) {}

        return $query->where(function ($q) use ($ownerId, $orgId) {
            if ($orgId) {
                $q->where('service_charges.organization_id', $orgId);
            }
            if ($ownerId) {
                $q->orWhere('service_charges.owner_id', $ownerId)
                  ->orWhereHas('unit', function ($u) use ($ownerId) {
                      $u->where('units.owner_id', $ownerId)
                        ->orWhereHas('property', fn ($p) => $p->where('properties.owner_id', $ownerId));
                  });
            }
        });
    }

    /**
     * Assert that the user has permission to access this service charge.
     */
    public function assertChargeAccess(ServiceCharge $charge, User $user): void
    {
        $this->contextResolver->assertActive($user);

        if ($user->role === 'admin') {
            return;
        }

        $ownerId = $this->contextResolver->ownerId($user);
        $orgId = null;
        try {
            $orgId = $this->contextResolver->organizationId($user);
        } catch (\Throwable) {}

        $matchesOrg = $orgId && ((int) $charge->organization_id === (int) $orgId);
        $matchesOwner = $ownerId && ((int) $charge->owner_id === (int) $ownerId);

        if (!$matchesOrg && !$matchesOwner) {
            $charge->loadMissing('unit.property');
            $unitOwner = (int) ($charge->unit?->owner_id ?? 0);
            $propOwner = (int) ($charge->unit?->property?->owner_id ?? 0);
            $matchesOwner = ($unitOwner === (int) $ownerId) || ($propOwner === (int) $ownerId);
            $unitOrg = (int) ($charge->unit?->organization_id ?? 0);
            $matchesOrg = $orgId && ($unitOrg === (int) $orgId);
        }

        abort_unless($matchesOrg || $matchesOwner, 404, 'Service charge not found.');
    }

    /**
     * Assert that the unit exists and belongs to the user's organization/owner.
     */
    public function assertUnitAccess(int $unitId, User $user): Unit
    {
        $this->contextResolver->assertActive($user);

        $unit = Unit::with('property')->find($unitId);
        abort_unless($unit, 404, 'Unit not found.');

        if ($user->role === 'admin') {
            return $unit;
        }

        $ownerId = $this->contextResolver->ownerId($user);
        $orgId = null;
        try {
            $orgId = $this->contextResolver->organizationId($user);
        } catch (\Throwable) {}

        $unitOwner = (int) ($unit->owner_id ?: $unit->property?->owner_id ?: 0);
        $matchesOwner = $ownerId && ($unitOwner === (int) $ownerId);
        $unitOrg = (int) ($unit->organization_id ?: 0);
        $matchesOrg = $orgId && ($unitOrg === (int) $orgId);

        abort_unless($matchesOwner || $matchesOrg, 422, 'Unit does not belong to your organization.');

        return $unit;
    }

    /**
     * Compute summary KPIs & property breakdown for service charges.
     */
    public function getSummary(User $user, array $filters = []): array
    {
        $this->contextResolver->assertActive($user);

        $ownerId = $user->role !== 'admin' ? $this->contextResolver->ownerId($user) : null;
        $orgId = null;
        try {
            $orgId = $user->role !== 'admin' ? $this->contextResolver->organizationId($user) : null;
        } catch (\Throwable) {}

        // 1. Get properties accessible to user
        $propQuery = Property::query();
        if ($user->role !== 'admin') {
            $propQuery->where(function ($q) use ($ownerId, $orgId) {
                if ($ownerId) {
                    $q->where('owner_id', $ownerId);
                }
                if ($orgId && SchemaHasOrgId()) {
                    $q->orWhere('organization_id', $orgId);
                }
            });
        }
        if (!empty($filters['property_id']) && $filters['property_id'] !== 'all') {
            $propQuery->where('id', $filters['property_id']);
        }
        if (!empty($filters['owner_id']) && $filters['owner_id'] !== 'all') {
            $propQuery->where('owner_id', $filters['owner_id']);
        }
        $properties = $propQuery->get(['id', 'name', 'owner_id']);

        // 2. Get units accessible to user
        $unitQuery = Unit::query();
        if ($user->role !== 'admin') {
            $unitQuery->where(function ($q) use ($ownerId, $orgId) {
                if ($ownerId) {
                    $q->where('owner_id', $ownerId)
                      ->orWhereHas('property', fn ($p) => $p->where('properties.owner_id', $ownerId));
                }
                if ($orgId) {
                    $q->orWhere('organization_id', $orgId);
                }
            });
        }
        if (!empty($filters['property_id']) && $filters['property_id'] !== 'all') {
            $unitQuery->where('property_id', $filters['property_id']);
        }
        if (!empty($filters['owner_id']) && $filters['owner_id'] !== 'all') {
            $unitQuery->where('owner_id', $filters['owner_id']);
        }
        $units = $unitQuery->get(['id', 'property_id', 'owner_id', 'monthly_service_charge']);

        // 3. Get charges query
        $chargeQuery = ServiceCharge::query();
        $this->scopeCharges($chargeQuery, $user);

        if (!empty($filters['property_id']) && $filters['property_id'] !== 'all') {
            $chargeQuery->where('property_id', $filters['property_id']);
        }
        if (!empty($filters['owner_id']) && $filters['owner_id'] !== 'all') {
            $chargeQuery->where('owner_id', $filters['owner_id']);
        }
        if (!empty($filters['period']) && $filters['period'] !== 'all') {
            $chargeQuery->whereYear('due_date', $filters['period']);
        }
        if (!empty($filters['from'])) {
            $chargeQuery->whereDate('due_date', '>=', $filters['from']);
        }
        if (!empty($filters['to'])) {
            $chargeQuery->whereDate('due_date', '<=', $filters['to']);
        }

        $charges = $chargeQuery->with('payments')->get();

        $totalBilled = 0.0;
        $totalPaid = 0.0;
        $totalWaived = 0.0;

        foreach ($charges as $c) {
            $amt = (float) $c->amount;
            if ($c->status === 'waived') {
                $totalWaived += $amt;
                continue;
            }
            $totalBilled += $amt;
            $paidSum = (float) $c->payments->sum('amount');
            if ($c->status === 'paid' && $paidSum <= 0) {
                $totalPaid += $amt;
            } else {
                $totalPaid += min($amt, $paidSum);
            }
        }
        $totalOutstanding = max(0.0, $totalBilled - $totalPaid);

        // Estimate Calculations per Dubai guidelines:
        // For each property:
        // Sum units.monthly_service_charge > 0.
        // For units missing rate: apply average of units that have rate in that property, or AED 250 fallback.
        $totalApproxMonthly = 0.0;
        $unitsMissingRate = 0;
        $byProperty = [];

        foreach ($properties as $prop) {
            $propUnits = $units->where('property_id', $prop->id);
            $propUnitCount = $propUnits->count();
            if ($propUnitCount === 0) {
                continue;
            }

            $knownRates = [];
            $propMissingCount = 0;
            foreach ($propUnits as $u) {
                $rate = (float) ($u->monthly_service_charge ?? 0);
                if ($rate > 0) {
                    $knownRates[] = $rate;
                } else {
                    $propMissingCount++;
                    $unitsMissingRate++;
                }
            }

            $propAvgRate = count($knownRates) > 0
                ? (array_sum($knownRates) / count($knownRates))
                : 250.0; // Dubai standard fallback

            $propMonthlyEstimate = array_sum($knownRates) + ($propMissingCount * $propAvgRate);
            $propQuarterEstimate = $propMonthlyEstimate * 3;
            $propYearlyEstimate  = $propMonthlyEstimate * 12;

            $totalApproxMonthly += $propMonthlyEstimate;

            // Charges for this property
            $propCharges = $charges->filter(fn ($c) => (int) $c->property_id === (int) $prop->id);
            $propBilled = 0.0;
            $propPaid = 0.0;
            foreach ($propCharges as $c) {
                if ($c->status === 'waived') continue;
                $amt = (float) $c->amount;
                $propBilled += $amt;
                $paidSum = (float) $c->payments->sum('amount');
                if ($c->status === 'paid' && $paidSum <= 0) {
                    $propPaid += $amt;
                } else {
                    $propPaid += min($amt, $paidSum);
                }
            }

            $byProperty[] = [
                'property_id'    => $prop->id,
                'name'           => $prop->name,
                'units'          => $propUnitCount,
                'approx_monthly' => round($propMonthlyEstimate, 2),
                'approx_quarter' => round($propQuarterEstimate, 2),
                'approx_yearly'  => round($propYearlyEstimate, 2),
                'billed'         => round($propBilled, 2),
                'paid'           => round($propPaid, 2),
                'outstanding'    => round(max(0.0, $propBilled - $propPaid), 2),
            ];
        }

        return [
            'approx_monthly'             => round($totalApproxMonthly, 2),
            'approx_quarter'             => round($totalApproxMonthly * 3, 2),
            'approx_yearly'              => round($totalApproxMonthly * 12, 2),
            'billed'                     => round($totalBilled, 2),
            'paid'                       => round($totalPaid, 2),
            'outstanding'                => round($totalOutstanding, 2),
            'waived'                     => round($totalWaived, 2),
            'units_missing_monthly_rate' => $unitsMissingRate,
            'by_property'                => $byProperty,
        ];
    }

    /**
     * Store OA/PM invoice document against a service charge.
     */
    public function storeDoc(ServiceCharge $charge, UploadedFile $file, string $docType = 'oa_invoice', ?int $userId = null): ServiceChargeDoc
    {
        $dir = 'service-charges/' . $charge->id;
        $path = $file->store($dir, 'local');

        return ServiceChargeDoc::create([
            'service_charge_id' => $charge->id,
            'file_name'         => $file->getClientOriginalName(),
            'file_path'         => $path,
            'mime_type'         => $file->getClientMimeType(),
            'file_size'         => $file->getSize(),
            'doc_type'          => $docType ?: 'oa_invoice',
            'uploaded_by'       => $userId,
        ]);
    }

    /**
     * Delete OA/PM invoice document and remove file from disk.
     */
    public function deleteDoc(ServiceChargeDoc $doc): void
    {
        if (Storage::disk('local')->exists($doc->file_path)) {
            Storage::disk('local')->delete($doc->file_path);
        }
        if (Storage::disk('public')->exists($doc->file_path)) {
            Storage::disk('public')->delete($doc->file_path);
        }
        $doc->delete();
    }
}

/**
 * Helper to check if properties table has organization_id column safely
 */
function SchemaHasOrgId(): bool
{
    static $has = null;
    if ($has === null) {
        $has = \Illuminate\Support\Facades\Schema::hasColumn('properties', 'organization_id');
    }
    return $has;
}
