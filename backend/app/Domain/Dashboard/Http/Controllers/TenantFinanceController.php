<?php

namespace App\Domain\Dashboard\Http\Controllers;

use App\Domain\Auth\Models\Tenant;
use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\RentTransaction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Tenant-scoped finance views (read-only).
 * All queries are limited to the authenticated tenant's contracts / payments.
 */
class TenantFinanceController extends Controller
{
    private function tenantId(Request $request): ?int
    {
        return Tenant::where('user_id', $request->user()->id)->value('id');
    }

    /**
     * Rent / DEWA ledger (debit/credit) for this tenant's contracts.
     */
    public function ledger(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        if (! $tenantId) {
            return response()->json([
                'status' => 'success',
                'data'   => [
                    'entries'      => [],
                    'total_debit'  => 0.0,
                    'total_credit' => 0.0,
                ],
            ]);
        }

        $scope = fn ($q) => $q->where('tenant_id', $tenantId);

        $entries = RentTransaction::whereHas('contract', $scope)
            ->with([
                'contract:id,unit_id,tenant_id',
                'contract.unit:id,number,property_id',
                'contract.unit.property:id,name',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        $totalDebit = (float) RentTransaction::whereHas('contract', $scope)->sum('debit');
        $totalCredit = (float) RentTransaction::whereHas('contract', $scope)->sum('credit');

        return response()->json([
            'status' => 'success',
            'data'   => [
                'entries'       => $entries,
                'total_debit'   => $totalDebit,
                'total_credit'  => $totalCredit,
                'total_balance' => $totalDebit - $totalCredit,
            ],
        ]);
    }

    /**
     * Payment history for this tenant.
     */
    public function payments(Request $request): JsonResponse
    {
        $tenantId = $this->tenantId($request);
        if (! $tenantId) {
            return response()->json([
                'status' => 'success',
                'data'   => [
                    'payments'     => [],
                    'total_amount' => 0.0,
                ],
            ]);
        }

        $payments = Payment::where('tenant_id', $tenantId)
            ->with([
                'contract:id,unit_id',
                'contract.unit:id,number,property_id',
                'contract.unit.property:id,name',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'payments'     => $payments,
                'total_amount' => (float) $payments->sum('amount'),
            ],
        ]);
    }
}
