<?php

namespace App\Domain\Dashboard\Services;

use App\Domain\Contract\Models\Contract;
use App\Domain\Payment\Models\RentTransaction;
use Carbon\Carbon;
use Carbon\CarbonInterface;

/**
 * Posts monthly rent-due debit entries for active contracts (idempotent per contract/month).
 * Shared by the scheduled monthly job and first-due posting on contract creation.
 */
class PostMonthlyRentService
{
    /**
     * Process active contracts to post their rent due for the current month.
     * Triggers: Scheduled monthly cron job or manual trigger.
     * Side-effects: Iterates over all active contracts and attempts to create a rent debit entry for the current month.
     *
     * @return array{posted: int, skipped: int, month: string} Summary of posted and skipped entries
     */
    public function postForCurrentMonth(): array
    {
        $activeContracts = Contract::where('status', 'active')->get();
        $month = Carbon::now()->startOfMonth();
        $monthLabel = $month->format('Y-m');
        $posted = 0;
        $skipped = 0;

        foreach ($activeContracts as $contract) {
            if ($this->postDueForContract($contract, $month)) {
                $posted++;
            } else {
                $skipped++;
            }
        }

        return [
            'posted'  => $posted,
            'skipped' => $skipped,
            'month'   => $monthLabel,
        ];
    }

    /**
     * Post a single rent-due debit for a contract/month if one does not already exist.
     * Triggers: Monthly cron job, ledger rebuilds, or initial contract creation.
     * Side-effects: Checks for an existing debit transaction for the specified month. If none exists, creates a new RentTransaction debit record for the rent amount.
     *
     * @param Contract $contract The contract to post rent for
     * @param CarbonInterface|null $forMonth The target month (defaults to current month)
     * @return bool true when a new debit row was created, false if already exists
     */
    public function postDueForContract(Contract $contract, ?CarbonInterface $forMonth = null): bool
    {
        $month = $forMonth
            ? Carbon::parse($forMonth)->startOfMonth()
            : Carbon::now()->startOfMonth();

        $monthLabel = $month->format('Y-m');

        if ($this->dueExistsForMonth($contract->id, $monthLabel)) {
            return false;
        }

        // Prefer contract due_date when it falls in the target month; else month start.
        $entryDate = $month->toDateString();
        if (! empty($contract->due_date)) {
            $due = Carbon::parse($contract->due_date);
            if ($due->format('Y-m') === $monthLabel) {
                $entryDate = $due->toDateString();
            }
        }

        RentTransaction::create([
            'contract_id' => $contract->id,
            'date'        => $entryDate,
            'description' => 'Rent due ' . $monthLabel,
            'debit'       => $contract->rent_amount,
            'credit'      => 0,
        ]);

        return true;
    }

    /**
     * First-month due for a newly created active contract (start_date month).
     */
    public function postInitialDueForContract(Contract $contract): bool
    {
        $start = ! empty($contract->start_date)
            ? Carbon::parse($contract->start_date)->startOfMonth()
            : Carbon::now()->startOfMonth();

        return $this->postDueForContract($contract, $start);
    }

    public function dueExistsForMonth(int $contractId, string $monthLabel): bool
    {
        $startOfMonth = Carbon::createFromFormat('Y-m', $monthLabel)->startOfMonth()->toDateString();
        $endOfMonth   = Carbon::createFromFormat('Y-m', $monthLabel)->endOfMonth()->toDateString();

        return RentTransaction::where('contract_id', $contractId)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->where('debit', '>', 0)
            ->where('description', 'like', 'Rent due%')
            ->exists();
    }
}
