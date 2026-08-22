<?php

namespace App\Domain\Dashboard\Services;

use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\Payment;
use App\Domain\Payment\Models\RentTransaction;
use Carbon\Carbon;

/**
 * Rebuilds rent_transactions for a contract from source data:
 * monthly rent-due debits from the contract + payment credits from ALL payment types.
 */
class LedgerRebuildService
{
    public function __construct(private readonly PostMonthlyRentService $postMonthlyRentService)
    {
    }

    /**
     * Rebuild the ledger transactions for a given contract.
     * Triggers: Manual ledger rebuild requests or data consistency checks.
     * Side-effects: Force deletes all existing RentTransactions for the contract, then recalculates
     * and posts due rent for each month from the contract start date up to the current date/end date,
     * and finally recreates credit transactions for all existing Payments associated with the contract.
     *
     * @param Contract $contract The contract whose ledger needs rebuilding
     * @return array{entries_created: int, debit_entries: int, credit_entries: int} Summary of created transactions
     */
    public function rebuild(Contract $contract): array
    {
        RentTransaction::withTrashed()->where('contract_id', $contract->id)->forceDelete();

        $startDate = Carbon::parse($contract->start_date)->startOfMonth();
        $endDate = Carbon::parse($contract->end_date)->startOfMonth();
        $today = now()->startOfMonth();
        $currentDate = $startDate->copy();

        $debitEntries = 0;
        while ($currentDate->lte($endDate) && $currentDate->lte($today)) {
            if ($this->postMonthlyRentService->postDueForContract($contract, $currentDate)) {
                $debitEntries++;
            }
            $currentDate->addMonth();
        }

        $creditCount = 0;
        $payments = Payment::where('contract_id', $contract->id)
            ->orderBy('date')
            ->get();

        foreach ($payments as $payment) {
            $typeLabel = strtoupper(str_replace('_', ' ', $payment->type));
            RentTransaction::create([
                'contract_id' => $contract->id,
                'payment_id'  => $payment->id,
                'date'        => Carbon::parse($payment->date)->toDateString(),
                'description' => $typeLabel . ' payment'
                    . ($payment->reference_number ? ' ref ' . $payment->reference_number : ''),
                'debit'       => 0,
                'credit'      => $payment->amount,
            ]);
            $creditCount++;
        }

        return [
            'entries_created' => $debitEntries + $creditCount,
            'debit_entries'   => $debitEntries,
            'credit_entries'  => $creditCount,
        ];
    }
}
