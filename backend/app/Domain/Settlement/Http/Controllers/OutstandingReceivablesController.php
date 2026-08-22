<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\RentTransaction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OutstandingReceivablesController extends Controller
{
    /**
     * Outstanding receivables report categorized by owner, current vs previous tenants
     */
    public function report(Request $request): JsonResponse
    {
        $contracts = Contract::with(['unit.property', 'tenant:id,name,email', 'owner:id,name'])
            ->get()
            ->map(function ($contract) {
                $outstanding = (float) RentTransaction::where('contract_id', $contract->id)
                    ->selectRaw('COALESCE(SUM(debit) - SUM(credit), 0) as bal')
                    ->value('bal');

                if ($outstanding <= 0) {
                    return null;
                }

                $tenantType = in_array($contract->status, ['active', 'renewed']) ? 'current' : 'previous';

                return [
                    'contract_id'   => $contract->id,
                    'status'        => $contract->status,
                    'tenant_type'   => $tenantType,
                    'tenant_name'   => $contract->tenant?->name,
                    'owner_id'      => $contract->owner_id,
                    'owner_name'    => $contract->owner?->name,
                    'unit_number'   => $contract->unit?->number,
                    'building_name' => $contract->unit?->property?->name,
                    'outstanding'   => $outstanding,
                ];
            })
            ->filter()
            ->values();

        if ($request->has('owner_id')) {
            $contracts = $contracts->where('owner_id', (int) $request->owner_id)->values();
        }

        if ($request->has('tenant_type')) {
            $contracts = $contracts->where('tenant_type', $request->tenant_type)->values();
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'receivables' => $contracts,
                'summary'     => [
                    'total_current'  => $contracts->where('tenant_type', 'current')->sum('outstanding'),
                    'total_previous' => $contracts->where('tenant_type', 'previous')->sum('outstanding'),
                    'grand_total'    => $contracts->sum('outstanding'),
                ],
            ],
        ]);
    }
}