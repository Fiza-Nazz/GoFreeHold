<?php

namespace App\Domain\Contract\Services;

use App\Domain\Contract\Models\Contract;
use App\Domain\Property\Models\Unit;
use Illuminate\Support\Facades\DB;

/**
 * Shared vacate logic for Contract → Vacate and Settlement → Completed.
 * Always sets contract status to vacated and linked unit to AVAILABLE.
 */
class ContractVacateService
{
    /**
     * Process vacating a contract and updating the unit status.
     * Triggers: A contract vacate request or settlement completion.
     * Side-effects: Updates the contract status to 'vacated', saves any notes, and marks the associated Unit as 'AVAILABLE'.
     *
     * @param Contract $contract The contract being vacated
     * @param string|null $notes Optional notes to append to the contract
     * @return void
     */
    public function vacate(Contract $contract, ?string $notes = null): void
    {
        DB::beginTransaction();
        try {
            $contract->update([
                'status' => 'vacated',
                'notes'  => $notes ?? $contract->notes,
            ]);
            Unit::where('id', $contract->unit_id)->update(['status' => 'AVAILABLE']);
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
