<?php

namespace App\Domain\Dashboard\Http\Controllers;

use App\Domain\Auth\Models\Owner;
use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\RentTransaction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Owner-scoped finance views (read-only).
 * All queries are limited to contracts where contracts.owner_id = owner profile id.
 */
class OwnerFinanceController extends Controller
{
    /**
     * Rent ledger (debit/credit) entries for this owner's contracts.
     */
    public function ledger(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        $scope = fn ($q) => app(\App\Domain\Auth\Services\OwnerContextResolver::class)->contracts($q, $ownerId);

        $entries = RentTransaction::whereHas('contract', $scope)
            ->with([
                'contract:id,unit_id,tenant_id',
                'contract.unit:id,number,property_id',
                'contract.unit.property:id,name',
                'contract.tenant:id,name',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'entries'      => $entries,
                'total_debit'  => (float) RentTransaction::whereHas('contract', $scope)->sum('debit'),
                'total_credit' => (float) RentTransaction::whereHas('contract', $scope)->sum('credit'),
            ],
        ]);
    }

    /**
     * Outstanding balance per contract (debit - credit) for this owner.
     */
    public function receivables(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        $contracts = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->contracts(Contract::query(), $ownerId)
            ->withSum('rentTransactions as total_debit', 'debit')
            ->withSum('rentTransactions as total_credit', 'credit')
            ->with([
                'unit:id,number,property_id',
                'unit.property:id,name',
                'tenant:id,name',
            ])
            ->get()
            ->map(function ($c) {
                $c->balance = (float) ($c->total_debit ?? 0) - (float) ($c->total_credit ?? 0);
                return $c;
            });

        return response()->json([
            'status' => 'success',
            'data'   => [
                'contracts'         => $contracts->values(),
                'total_outstanding' => (float) $contracts->sum('balance'),
            ],
        ]);
    }

    /**
     * Payment history against this owner's contracts.
     */
    public function payments(Request $request): JsonResponse
    {
        $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($request->user());

        $payments = Payment::whereHas('contract', fn ($q) => app(\App\Domain\Auth\Services\OwnerContextResolver::class)->contracts($q, $ownerId))
            ->with([
                'contract:id,unit_id',
                'contract.unit:id,number,property_id',
                'contract.unit.property:id,name',
                'tenant:id,name',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'payments'     => $payments,
                'total_amount' => (float) Payment::whereHas('contract', fn ($q) => app(\App\Domain\Auth\Services\OwnerContextResolver::class)->contracts($q, $ownerId))->sum('amount'),
            ],
        ]);
    }
}
