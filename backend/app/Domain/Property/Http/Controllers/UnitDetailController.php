<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Contract\Models\Contract;
use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\RentTransaction;
use App\Domain\Property\Models\Unit;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitDetailController extends Controller
{
    public function __construct(
        private readonly OwnerContextResolver $contextResolver
    ) {
    }

    /**
     * Single unit detail endpoint fulfilling Unit Detail API specification:
     * Returns unit profile, property details, active contract, recent payments (plain array max 20),
     * and rent statement sub-ledger (plain array entries + summary with signed balance) in one response.
     */
    public function show(Request $request, int $unit): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        // Platform admin and tenant are strictly blocked from org unit-detail endpoint
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

        $unitModel = Unit::with([
            'property',
            'contracts' => fn ($q) => $q->latest('id'),
            'activeContract.tenant',
            'activeContract.cheques',
            'activeContract.docs',
        ])->find($unit);

        if (!$unitModel || !$unitModel->property) {
            return response()->json([
                'message' => 'Unit not found.',
                'code'    => 'UNIT_NOT_FOUND',
            ], 404);
        }

        $property = $unitModel->property;

        // Role boundary & assignment check:
        if (in_array($user->role, ['cashier', 'accountant'], true)) {
            // Staff are assigned strictly to their employing owner's properties
            if ((int) $property->owner_id !== (int) $ownerId && (int) $unitModel->owner_id !== (int) $ownerId) {
                return response()->json([
                    'message' => 'Unit not found.',
                    'code'    => 'UNIT_NOT_FOUND',
                ], 404);
            }
        } else {
            // Owner can access properties under their owner_id or organization_id
            $allowed = false;
            if ($ownerId && ((int) $property->owner_id === (int) $ownerId || (int) $unitModel->owner_id === (int) $ownerId)) {
                $allowed = true;
            }
            if ($orgId && ((int) $property->organization_id === (int) $orgId || (int) $unitModel->organization_id === (int) $orgId)) {
                $allowed = true;
            }
            if (!$allowed) {
                return response()->json([
                    'message' => 'Unit not found.',
                    'code'    => 'UNIT_NOT_FOUND',
                ], 404);
            }
        }

        // Active contract only — never embed vacated/expired/draft as active_contract
        /** @var Contract|null $activeContract */
        $activeContract = $unitModel->activeContract;
        if (!$activeContract) {
            $activeContract = $unitModel->contracts
                ->first(fn ($c) => strtolower(trim((string) $c->status)) === 'active');
            if ($activeContract) {
                $activeContract->loadMissing(['tenant', 'cheques', 'docs']);
            }
        }

        $activeContractData = null;
        $recentPayments = [];
        $statementEntries = [];
        $totalDebit = 0.00;
        $totalCredit = 0.00;
        $totalBalance = 0.00;

        if ($activeContract) {
            // Lease term normalization
            $rawTerm = (string) ($activeContract->lease_term ?? '');
            $isMonthly = stripos($rawTerm, 'month') !== false;
            $leaseTerm = $isMonthly ? 'Monthly' : ($rawTerm ?: 'Yearly');

            // Monthly rent calculation: Yearly contracts normalized to monthly
            $rawRent = (float) ($activeContract->rent_amount ?? 0);
            $monthlyRent = $isMonthly ? round($rawRent, 2) : round($rawRent / 12, 2);

            // Rent statement sub-ledger entries (plain array)
            $txs = RentTransaction::where('contract_id', $activeContract->id)
                ->orderBy('date', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            foreach ($txs as $tx) {
                $debit = round((float) ($tx->debit ?? 0), 2);
                $credit = round((float) ($tx->credit ?? 0), 2);
                $totalDebit += $debit;
                $totalCredit += $credit;

                $dateStr = $tx->date instanceof \DateTimeInterface
                    ? $tx->date->format('Y-m-d')
                    : (is_string($tx->date) ? substr($tx->date, 0, 10) : null);

                $statementEntries[] = [
                    'id'          => $tx->id,
                    'date'        => $dateStr,
                    'description' => $tx->description ?? '',
                    'debit'       => $debit,
                    'credit'      => $credit,
                ];
            }

            $totalDebit = round($totalDebit, 2);
            $totalCredit = round($totalCredit, 2);
            $totalBalance = round($totalDebit - $totalCredit, 2);
            if (abs($totalBalance) < 0.0001) {
                $totalBalance = 0.00;
            }

            // Signed due calculation: strictly signed, NO max(0, …) clamping (negative = overpaid)
            if ($txs->isNotEmpty()) {
                $due = $totalBalance;
            } elseif ($activeContract->due !== null) {
                $due = round((float) $activeContract->due, 2);
            } else {
                // Fallback: monthly_rent - payments_this_period (may be negative when overpaid)
                $paymentsSum = (float) (Payment::where('contract_id', $activeContract->id)->sum('amount') ?? 0);
                $due = $paymentsSum > 0 ? round($monthlyRent - $paymentsSum, 2) : 0.00;
            }

            if (abs($due) < 0.0001) {
                $due = 0.00;
            }

            // Dates formatted as YYYY-MM-DD
            $startDate = $activeContract->start_date instanceof \DateTimeInterface
                ? $activeContract->start_date->format('Y-m-d')
                : (is_string($activeContract->start_date) ? substr($activeContract->start_date, 0, 10) : null);

            $endDate = $activeContract->end_date instanceof \DateTimeInterface
                ? $activeContract->end_date->format('Y-m-d')
                : (is_string($activeContract->end_date) ? substr($activeContract->end_date, 0, 10) : null);

            $dueDate = $activeContract->due_date instanceof \DateTimeInterface
                ? $activeContract->due_date->format('Y-m-d')
                : (is_string($activeContract->due_date) ? substr($activeContract->due_date, 0, 10) : null);

            // Tenant payload
            $tenantObj = null;
            if ($activeContract->tenant) {
                $t = $activeContract->tenant;
                $tenantObj = [
                    'id'      => $t->id,
                    'name'    => $t->name,
                    'phone'   => $t->phone ?? $t->contact,
                    'contact' => $t->contact ?? $t->phone,
                    'email'   => $t->email,
                    'address' => $t->address,
                ];
            }

            // Cheques plain array
            $cheques = ($activeContract->cheques ?? collect())->map(function ($c) {
                $dDate = $c->due_date instanceof \DateTimeInterface
                    ? $c->due_date->format('Y-m-d')
                    : (is_string($c->due_date) ? substr($c->due_date, 0, 10) : null);

                return [
                    'id'                  => $c->id,
                    'contract_id'         => $c->contract_id,
                    'cheque_number'       => $c->cheque_number,
                    'bank_name'           => $c->bank_name,
                    'amount'              => (float) $c->amount,
                    'due_date'            => $dDate,
                    'status'              => $c->status,
                    'account_holder_name' => $c->account_holder_name,
                    'payee_name'          => $c->payee_name,
                    'nature'              => $c->nature,
                    'type'                => $c->type,
                    'notes'               => $c->notes,
                ];
            })->values()->all();

            // Documents plain array
            $documents = ($activeContract->docs ?? collect())->map(function ($d) {
                return [
                    'id'          => $d->id,
                    'contract_id' => $d->contract_id,
                    'file_name'   => $d->file_name,
                    'file_path'   => $d->file_path,
                ];
            })->values()->all();

            $activeContractData = [
                'id'               => $activeContract->id,
                'tenant_id'        => $activeContract->tenant_id,
                'status'           => 'active',
                'lease_term'       => $leaseTerm,
                'mode_of_payment'  => $activeContract->mode_of_payment,
                'rent_amount'      => (float) ($activeContract->rent_amount ?? 0),
                'security_deposit' => (float) ($activeContract->security_deposit ?? 0),
                'dewa_deposit'     => (float) ($activeContract->dewa_deposit ?? 0),
                'deposit_type'     => $activeContract->deposit_type,
                'start_date'       => $startDate,
                'end_date'         => $endDate,
                'due_date'         => $dueDate,
                'grace_period'     => (int) ($activeContract->grace_period ?? 0),
                'on_case'          => (bool) ($activeContract->on_case ?? false),
                'due'              => $due,
                'monthly_rent'     => $monthlyRent,
                'tenant'           => $tenantObj,
                'cheques'          => $cheques,
                'documents'        => $documents,
            ];

            // Recent payments: plain array, max 20, newest first
            $recentPayments = Payment::where('contract_id', $activeContract->id)
                ->latest('date')
                ->latest('id')
                ->limit(20)
                ->get()
                ->map(function ($p) {
                    $pDate = $p->date instanceof \DateTimeInterface
                        ? $p->date->format('Y-m-d')
                        : (is_string($p->date) ? substr($p->date, 0, 10) : null);

                    return [
                        'id'             => $p->id,
                        'contract_id'    => $p->contract_id,
                        'date'           => $pDate,
                        'type'           => strtoupper(trim((string) $p->type)),
                        'amount'         => (float) $p->amount,
                        'mode'           => strtoupper(trim((string) $p->mode)),
                        'remarks'        => $p->remarks,
                        'receipt_number' => $p->receipt_number,
                    ];
                })
                ->values()
                ->all();

            $unitStatus = 'OCCUPIED';
        } else {
            // Vacant / Booked unit
            $rawStatus = strtoupper(trim((string) ($unitModel->status ?? 'AVAILABLE')));
            $unitStatus = $rawStatus === 'BOOKED' ? 'BOOKED' : 'AVAILABLE';
        }

        $statement = [
            'entries' => $statementEntries,
            'summary' => [
                'total_debit'   => $totalDebit,
                'total_credit'  => $totalCredit,
                'total_balance' => $totalBalance,
            ],
        ];

        // Fetch complaints for backward-compatibility
        $complaints = Complaint::where('unit_id', $unitModel->id)
            ->with(['job.assignedTo:id,name'])
            ->latest()
            ->take(5)
            ->get();

        $responseUnit = [
            'id'                     => $unitModel->id,
            'number'                 => (string) $unitModel->number,
            'floor'                  => $unitModel->floor,
            'type'                   => $unitModel->type,
            'category'               => $unitModel->category,
            'size'                   => $unitModel->size,
            'furnished'              => (bool) $unitModel->furnished,
            'price'                  => $unitModel->price,
            'monthly_service_charge' => $unitModel->monthly_service_charge,
            'status'                 => $unitStatus,
            'dhewa_no'               => $unitModel->dhewa_no,
            'image'                  => $unitModel->image,
            'image_url'              => $unitModel->image_url,
            'property'               => [
                'id'      => $property->id,
                'name'    => $property->name,
                'address' => $property->address,
                'city'    => $property->city,
                'type'    => $property->type,
            ],
            'active_contract'        => $activeContractData,
            'recent_payments'        => $recentPayments,
            'statement'              => $statement,
            // Preserved for backward compatibility
            'contracts_count'        => $unitModel->contracts->count(),
            'recent_contracts'       => $unitModel->contracts->take(5)->values()->all(),
            'recent_complaints'      => $complaints,
        ];

        return response()->json([
            'status' => 'success',
            'data'   => [
                'unit' => $responseUnit,
            ],
        ]);
    }
}
