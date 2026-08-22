<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\RentTransaction;
use App\Domain\Payment\Models\ServiceCharge;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayableController extends Controller
{
    /**
     * Contract payables tracking — summary of all outstanding dues per contract
     */
    public function summary(Request $request): JsonResponse
    {
        $contracts = Contract::with(['unit:id,number,property_id', 'unit.property:id,name', 'tenant:id,name'])
            ->where('status', 'active')
            ->get();

        $payables = $contracts->map(function ($contract) {
            $rentOutstanding = (float) RentTransaction::where('contract_id', $contract->id)
                ->selectRaw('COALESCE(SUM(debit) - SUM(credit), 0) as bal')
                ->value('bal');

            $serviceOutstanding = ServiceCharge::where('contract_id', $contract->id)
                ->where('status', 'pending')
                ->sum('amount');

            return [
                'contract_id'         => $contract->id,
                'unit'                => $contract->unit?->number,
                'building'            => $contract->unit?->property?->name,
                'tenant'              => $contract->tenant?->name,
                'rent_outstanding'    => max(0, $rentOutstanding),
                'service_outstanding' => $serviceOutstanding,
                'total_payable'       => max(0, $rentOutstanding) + $serviceOutstanding,
            ];
        })->filter(fn ($item) => $item['total_payable'] > 0)->values();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'payables'    => $payables,
                'grand_total' => $payables->sum('total_payable'),
            ],
        ]);
    }
}