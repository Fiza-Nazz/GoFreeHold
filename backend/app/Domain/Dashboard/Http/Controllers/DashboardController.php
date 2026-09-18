<?php

namespace App\Domain\Dashboard\Http\Controllers;

use App\Domain\Dashboard\Http\Resources\PortfolioSummaryResource;
use App\Domain\Dashboard\Http\Resources\PropertyDrillDownResource;
use App\Domain\Dashboard\Http\Resources\UnitDetailResource;
use App\Http\Controllers\Controller;
use App\Domain\Contract\Models\Contract;
use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Auth\Models\Owner;
use App\Domain\Payment\Models\Payment;
use App\Domain\Property\Models\Property;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Property\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Admin system-wide dashboard summary — total counts across all modules.
     */
    public function adminSummary(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => [
                'owners'           => Owner::count(),
                'properties'       => Property::count(),
                'units'            => Unit::count(),
                'units_occupied'   => Unit::where('status', 'OCCUPIED')->count(),
                'units_available'  => Unit::where('status', 'AVAILABLE')->count(),
                'units_booked'     => Unit::where('status', 'BOOKED')->count(),
                'units_sold'       => Unit::where('status', 'SOLD')->count(),
                'tenants'          => Tenant::count(),
                'contracts_active' => Contract::where('status', 'active')->count(),
                'contracts_total'  => Contract::count(),
                'complaints_open'  => Complaint::where('status', 'open')->count(),
                'total_payments'   => Payment::sum('amount'),
            ],
        ]);
    }

    /**
     * Owner portfolio summary — properties, units, occupancy.
     */
    public function ownerSummary(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        $portfolio = [
            'total_properties' => Property::where('owner_id', $ownerId)->count(),
            'total_units'      => app(\App\Domain\Auth\Services\OwnerContextResolver::class)->units(Unit::query(), $ownerId)->count(),
            'occupied_units'   => app(\App\Domain\Auth\Services\OwnerContextResolver::class)->units(Unit::query(), $ownerId)->where('status', 'OCCUPIED')->count(),
            'vacant_units'     => app(\App\Domain\Auth\Services\OwnerContextResolver::class)->units(Unit::query(), $ownerId)->where('status', 'AVAILABLE')->count(),
            'booked_units'     => app(\App\Domain\Auth\Services\OwnerContextResolver::class)->units(Unit::query(), $ownerId)->where('status', 'BOOKED')->count(),
        ];

        return response()->json([
            'status' => 'success',
            'data'   => [
                'portfolio' => (new PortfolioSummaryResource($portfolio))->resolve(),
            ],
        ]);
    }

    /**
     * Properties list with unit occupancy counts (drill-down level 1).
     */
    public function propertyDrillDown(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        $properties = Property::where('owner_id', $ownerId)
            ->withCount(['units as total_units'])
            ->withCount(['units as occupied_units' => fn ($q) => $q->where('status', 'OCCUPIED')])
            ->withCount(['units as vacant_units' => fn ($q) => $q->where('status', 'AVAILABLE')])
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'properties' => PropertyDrillDownResource::collection($properties)->resolve(),
            ],
        ]);
    }

    /**
     * Units for a specific owned property (drill-down level 2).
     */
    public function propertyUnits(Request $request, Property $property): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        if ((int) $property->owner_id !== (int) $ownerId) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        $units = Unit::where('property_id', $property->id)->where('owner_id', $ownerId)->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'property' => $property,
                'units'    => UnitDetailResource::collection($units)->resolve(),
            ],
        ]);
    }

    /**
     * Single unit details for an owned unit (drill-down level 3).
     */
    public function unitDetail(Request $request, Unit $unit): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        if ((int) $unit->owner_id !== (int) $ownerId && (int) $unit->property?->owner_id !== $ownerId) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        $unit->load([
            'property:id,name,address,city,type',
            'contracts' => fn ($q) => $q->with('tenant:id,name,email,phone,contact')->latest(),
        ]);

        $activeContract = $unit->contracts->firstWhere('status', 'active') ?? $unit->contracts->first();
        $complaints = \App\Domain\Maintenance\Models\Complaint::where('unit_id', $unit->id)
            ->with(['job.assignedTo:id,name'])
            ->latest()
            ->take(5)
            ->get();

        $unitData = (new UnitDetailResource($unit))->resolve();
        $unitData['active_contract'] = $activeContract;
        $unitData['contracts_count'] = $unit->contracts->count();
        $unitData['recent_contracts'] = $unit->contracts->take(5);
        $unitData['recent_complaints'] = $complaints;

        return response()->json([
            'status' => 'success',
            'data'   => [
                'unit' => $unitData,
            ],
        ]);
    }

    /**
     * Vacant (AVAILABLE) units for this owner, optional property_id filter.
     */
    public function vacantUnits(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        $query = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->units(Unit::query(), $ownerId)
            ->where('status', 'AVAILABLE')
            ->with('property:id,name');

        $propertyId = $request->input('property_id', $request->input('building_id'));
        if ($propertyId) {
            $query->where('property_id', $propertyId);
        }

        $vacantUnits = $query->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'units' => UnitDetailResource::collection($vacantUnits)->resolve(),
            ],
        ]);
    }
}
