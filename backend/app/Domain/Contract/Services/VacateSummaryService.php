<?php

namespace App\Domain\Contract\Services;

use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\ContractPayable;
use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\RentTransaction;
use App\Domain\Payment\Models\ServiceCharge;
use Carbon\Carbon;

class VacateSummaryService
{
    /**
     * Calculate read-only pre-vacate dues, payments received, and settlement preview.
     *
     * @param Contract $contract
     * @param string|null $asOf Date in Y-m-d format (defaults to contract end_date or today)
     * @return array
     */
    public function calculate(Contract $contract, ?string $asOf = null): array
    {
        // 1. Resolve cutoff date: as_of parameter, defaulting to contract end_date or today
        if ($asOf && trim($asOf) !== '') {
            try {
                $asOfDate = Carbon::parse($asOf)->toDateString();
            } catch (\Throwable) {
                $asOfDate = $contract->end_date
                    ? Carbon::parse($contract->end_date)->toDateString()
                    : Carbon::today()->toDateString();
            }
        } else {
            $asOfDate = $contract->end_date
                ? Carbon::parse($contract->end_date)->toDateString()
                : Carbon::today()->toDateString();
        }

        // Ensure relations are loaded
        $contract->loadMissing(['unit.property', 'tenant', 'owner']);

        // 2. Unit / Contract Details
        $tenantName = $contract->tenant?->name ?? 'N/A';
        $unit = $contract->unit;
        $property = $unit?->property;

        $contractInfo = [
            'id'               => $contract->id,
            'lease_term'       => $contract->lease_term,
            'rent_amount'      => (float) ($contract->rent_amount ?? 0),
            'security_deposit' => (float) ($contract->security_deposit ?? 0),
            'dewa_deposit'     => (float) ($contract->dewa_deposit ?? 0),
            'start_date'       => $contract->start_date ? Carbon::parse($contract->start_date)->toDateString() : null,
            'end_date'         => $contract->end_date ? Carbon::parse($contract->end_date)->toDateString() : null,
            'status'           => $contract->status,
        ];

        $tenantInfo = [
            'id'    => $contract->tenant?->id,
            'name'  => $tenantName,
            'email' => $contract->tenant?->email,
            'phone' => $contract->tenant?->phone ?? $contract->tenant?->contact,
        ];

        $unitInfo = [
            'id'            => $unit?->id,
            'number'        => $unit?->number,
            'label'         => $unit?->number ? 'Unit ' . $unit->number : 'N/A',
            'type'          => $unit?->type,
            'property_id'   => $property?->id,
            'property_name' => $property?->name,
        ];

        $propertyInfo = [
            'id'   => $property?->id,
            'name' => $property?->name,
        ];

        // 3. Receivables (defaults for editable fields)
        // Total Rent -> SUM(rent_transactions.debit) for contract where date <= as_of and description is rent-due
        $totalRentDue = (float) RentTransaction::where('contract_id', $contract->id)
            ->whereDate('date', '<=', $asOfDate)
            ->where(function ($q) {
                $q->where('description', 'LIKE', 'Rent due%')
                  ->orWhere('description', 'LIKE', 'Rent Due%')
                  ->orWhere('description', 'LIKE', 'rent due%');
            })
            ->sum('debit');

        // Total Dewa -> default 0 (no solid debit source today)
        $totalDewaDue = 0.00;

        // Other Charges -> unpaid contract_payables + unpaid service_charges if present, else 0
        $unpaidPayables = (float) ContractPayable::where('contract_id', $contract->id)
            ->where(function ($q) {
                $q->whereNull('status')->orWhere('status', '!=', 'paid');
            })
            ->where(function ($q) use ($asOfDate) {
                $q->whereNull('due_date')->orWhereDate('due_date', '<=', $asOfDate);
            })
            ->sum('amount');

        $unpaidServiceCharges = (float) ServiceCharge::where('contract_id', $contract->id)
            ->where(function ($q) {
                $q->where('status', 'pending')
                  ->orWhere(function ($sub) {
                      $sub->where('status', '!=', 'paid')->where('status', '!=', 'waived');
                  });
            })
            ->where(function ($q) use ($asOfDate) {
                $q->whereNull('due_date')->orWhereDate('due_date', '<=', $asOfDate);
            })
            ->sum('amount');

        $otherCharges = round($unpaidPayables + $unpaidServiceCharges, 2);

        // Admin Charge / Extra Fee -> defaults only (e.g. admin 250 or config; extra 0)
        $adminCharge = (float) config('services.vacate.admin_charge', 250.00);
        $extraFee = (float) config('services.vacate.extra_fee', 0.00);

        $receivablesTotal = round($totalRentDue + $totalDewaDue + $otherCharges + $adminCharge + $extraFee, 2);

        $receivables = [
            'total_rent'    => $totalRentDue,
            'rent'          => $totalRentDue,
            'total_dewa'    => $totalDewaDue,
            'dewa'          => $totalDewaDue,
            'other_charges' => $otherCharges,
            'other'         => $otherCharges,
            'admin_charge'  => $adminCharge,
            'admin_fee'     => $adminCharge,
            'extra_fee'     => $extraFee,
            'total'         => $receivablesTotal,
        ];

        // 4. Received
        // From payments for contract, date <= as_of, grouped by type:
        // rent -> Total Rent Paid
        // dewa -> Total Dewa Paid
        // other / service_charge -> Other Charges Paid
        $payments = Payment::where('contract_id', $contract->id)
            ->whereDate('date', '<=', $asOfDate)
            ->get();

        $rentPaid = (float) $payments->where('type', 'rent')->sum('amount');
        $dewaPaid = (float) $payments->where('type', 'dewa')->sum('amount');
        $otherPaid = (float) $payments->filter(function ($p) {
            return in_array($p->type, ['other', 'service_charge'], true);
        })->sum('amount');

        $receivedTotal = round($rentPaid + $dewaPaid + $otherPaid, 2);

        $received = [
            'total_rent_paid'    => $rentPaid,
            'rent'               => $rentPaid,
            'total_dewa_paid'    => $dewaPaid,
            'dewa'               => $dewaPaid,
            'other_charges_paid' => $otherPaid,
            'other'              => $otherPaid,
            'total'              => $receivedTotal,
        ];

        // 5. Settlement preview
        // Deposits = security_deposit + dewa_deposit
        // Amount Due = (deposits + received_total) - receivables_total
        // (same formula as UI; negative = tenant still owes)
        $securityDeposit = (float) ($contract->security_deposit ?? 0);
        $dewaDeposit = (float) ($contract->dewa_deposit ?? 0);
        $depositsTotal = round($securityDeposit + $dewaDeposit, 2);

        $amountDue = round(($depositsTotal + $receivedTotal) - $receivablesTotal, 2);

        $settlementPreview = [
            'security_deposit'  => $securityDeposit,
            'dewa_deposit'      => $dewaDeposit,
            'deposits'          => $depositsTotal,
            'deposits_total'    => $depositsTotal,
            'received_total'    => $receivedTotal,
            'receivables_total' => $receivablesTotal,
            'amount_due'        => $amountDue,
            'status'            => $amountDue < 0 ? 'due' : ($amountDue > 0 ? 'refund' : 'settled'),
        ];

        return [
            'as_of'              => $asOfDate,
            'contract'           => $contractInfo,
            'tenant'             => $tenantInfo,
            'unit'               => $unitInfo,
            'property'           => $propertyInfo,
            'receivables'        => $receivables,
            'received'           => $received,
            'settlement_preview' => $settlementPreview,
        ];
    }
}
