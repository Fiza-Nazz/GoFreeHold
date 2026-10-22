<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Property\Models\Property;
use App\Domain\Property\Models\Unit;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PropertyUnitBoardController extends Controller
{
    public function __construct(
        private readonly OwnerContextResolver $contextResolver
    ) {
    }

    public function show(Request $request, int $property): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        // Platform admin and tenant are strictly blocked from org unit-board
        if (in_array($user->role, ['admin', 'tenant'], true)) {
            return response()->json([
                'message' => 'ACCOUNT_ACCESS_DENIED',
                'code'    => 'ACCOUNT_ACCESS_DENIED',
            ], 403);
        }

        // Verify account is active and organization is not suspended
        try {
            $this->contextResolver->assertActive($user);
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            return response()->json([
                'message' => 'ACCOUNT_ACCESS_DENIED',
                'code'    => 'ACCOUNT_ACCESS_DENIED',
            ], $e->getStatusCode());
        } catch (\Throwable) {
            return response()->json([
                'message' => 'ACCOUNT_ACCESS_DENIED',
                'code'    => 'ACCOUNT_ACCESS_DENIED',
            ], 403);
        }

        $orgId = null;
        try {
            $orgId = $this->contextResolver->organizationId($user);
        } catch (\Throwable) {}

        $ownerId = null;
        try {
            $ownerId = $this->contextResolver->ownerId($user);
        } catch (\Throwable) {}

        // Property lookup scoped to organization and owner
        $propertyQuery = Property::where('id', $property);

        if (in_array($user->role, ['cashier', 'accountant'], true)) {
            // Staff are assigned strictly to their employing owner's properties
            $propertyQuery->where('owner_id', $ownerId);
        } else {
            // Owner can access properties under their owner_id or organization_id
            if ($orgId && $ownerId) {
                $propertyQuery->where(function ($q) use ($orgId, $ownerId) {
                    $q->where('owner_id', $ownerId)
                      ->orWhere('organization_id', $orgId);
                });
            } elseif ($ownerId) {
                $propertyQuery->where('owner_id', $ownerId);
            } elseif ($orgId) {
                $propertyQuery->where('organization_id', $orgId);
            }
        }

        $propertyModel = $propertyQuery->first();

        if (!$propertyModel) {
            return response()->json([
                'message' => 'Property not found.',
                'code'    => 'PROPERTY_NOT_FOUND',
            ], 404);
        }

        // Logical ordering for unit numbers across MySQL and SQLite
        $driver = DB::getDriverName();
        $orderRaw = $driver === 'sqlite'
            ? 'CAST(number AS INTEGER), number'
            : 'CAST(number AS UNSIGNED), number';

        // Fetch units with eager-loaded active contracts, tenants, and ledger entries
        $units = Unit::where('property_id', $propertyModel->id)
            ->with([
                'activeContract.tenant:id,name',
                'activeContract.rentTransactions' => function ($q) {
                    $q->select('id', 'contract_id', 'debit', 'credit');
                },
            ])
            ->orderByRaw($orderRaw)
            ->get();

        $cards = $units->map(function (Unit $unit) {
            $contract = $unit->activeContract;

            $rent = null;
            $due = null;
            $leaseTerm = null;
            $contractId = null;
            $tenantName = null;
            $onCase = false;

            if ($contract) {
                $contractId = $contract->id;
                $tenantName = $contract->tenant?->name;
                $onCase = (bool) ($contract->on_case ?? false);

                // Lease term normalization (Section 5.2)
                $rawTerm = (string) ($contract->lease_term ?? '');
                $isMonthly = stripos($rawTerm, 'month') !== false;
                $leaseTerm = $isMonthly ? 'Monthly' : 'Yearly';

                // Monthly rent calculation: Yearly contracts normalized to monthly
                $rawRent = (float) ($contract->rent_amount ?? 0);
                $rent = $isMonthly ? round($rawRent, 2) : round($rawRent / 12, 2);

                // Due calculation (Section 5.3: preferred order, strictly signed, NO max(0, …) clamping)
                if ($contract->relationLoaded('rentTransactions') && $contract->rentTransactions->isNotEmpty()) {
                    $debitSum = (float) $contract->rentTransactions->sum('debit');
                    $creditSum = (float) $contract->rentTransactions->sum('credit');
                    $due = round($debitSum - $creditSum, 2);
                } elseif ($contract->due !== null) {
                    $due = round((float) $contract->due, 2);
                } else {
                    // Fallback: monthly_rent - payments_this_period (may be negative when overpaid)
                    $paymentsSum = (float) ($contract->payments()->sum('amount') ?? 0);
                    $due = $paymentsSum > 0 ? round($rent - $paymentsSum, 2) : 0.00;
                }

                // Normalise -0.00 to 0.00
                if (abs($due) < 0.0001) {
                    $due = 0.00;
                }

                // Active contract truth over stale unit status (Section 5.4)
                $cardStatus = 'OCCUPIED';
            } else {
                $rawStatus = strtoupper(trim((string) ($unit->status ?? 'AVAILABLE')));
                if ($rawStatus === 'BOOKED') {
                    $cardStatus = 'BOOKED';
                } else {
                    $cardStatus = 'AVAILABLE'; // handles AVAILABLE, VACANT, or null
                }
            }

            return [
                'id'          => $unit->id,
                'number'      => (string) $unit->number,
                'type'        => $unit->type,
                'category'    => $unit->category,
                'status'      => $cardStatus,
                'on_case'     => $onCase,
                'rent'        => $rent,
                'due'         => $due,
                'lease_term'  => $leaseTerm,
                'contract_id' => $contractId,
                'tenant_name' => $tenantName,
            ];
        });

        // Filter by section if requested (Section 3.3)
        if ($request->filled('section')) {
            $section = strtolower(trim((string) $request->section));
            if ($section === 'commercial') {
                $cards = $cards->filter(fn ($c) => $this->isCommercial($c['type'], $c['category']));
            } elseif ($section === 'residential') {
                $cards = $cards->filter(fn ($c) => !$this->isCommercial($c['type'], $c['category']));
            }
        }

        // Filter by status if requested (Section 3.3)
        if ($request->filled('status')) {
            $reqStatus = strtoupper(trim((string) $request->status));
            if ($reqStatus === 'VACANT') {
                $reqStatus = 'AVAILABLE';
            }
            if (in_array($reqStatus, ['AVAILABLE', 'OCCUPIED', 'BOOKED'], true)) {
                $cards = $cards->filter(fn ($c) => $c['status'] === $reqStatus);
            }
        }

        $cardsList = $cards->values()->all();

        // Calculate summary aggregates (Section 4.3)
        $totalMonthlyRent = 0.00;
        $totalDue = 0.00;
        $occupiedCount = 0;
        $vacantCount = 0;
        $bookedCount = 0;
        $onCaseCount = 0;

        foreach ($cardsList as $card) {
            if ($card['rent'] !== null) {
                $totalMonthlyRent += (float) $card['rent'];
            }
            if ($card['due'] !== null) {
                $totalDue += (float) $card['due'];
            }
            if ($card['status'] === 'OCCUPIED') {
                $occupiedCount++;
            } elseif ($card['status'] === 'AVAILABLE') {
                $vacantCount++;
            } elseif ($card['status'] === 'BOOKED') {
                $bookedCount++;
            }
            if ($card['on_case']) {
                $onCaseCount++;
            }
        }

        return response()->json([
            'data' => [
                'property' => [
                    'id'      => $propertyModel->id,
                    'name'    => $propertyModel->name,
                    'address' => $propertyModel->address,
                    'city'    => $propertyModel->city,
                ],
                'units'   => $cardsList,
                'summary' => [
                    'total_units'        => count($cardsList),
                    'occupied'           => $occupiedCount,
                    'vacant'             => $vacantCount,
                    'booked'             => $bookedCount,
                    'on_case'            => $onCaseCount,
                    'total_monthly_rent' => round($totalMonthlyRent, 2),
                    'total_due'          => round($totalDue, 2),
                ],
            ],
        ]);
    }

    private function isCommercial(?string $type, ?string $category): bool
    {
        $text = strtolower(trim(($type ?? '') . ' ' . ($category ?? '')));
        return str_contains($text, 'shop')
            || str_contains($text, 'office')
            || str_contains($text, 'commercial')
            || str_contains($text, 'retail');
    }
}
