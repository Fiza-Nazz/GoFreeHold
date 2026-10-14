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
     * @param bool $allowIdempotent If true, does not fail if already vacated
     * @return void
     */
    public function vacate(Contract $contract, ?string $notes = null, bool $allowIdempotent = false): void
    {
        DB::transaction(function () use ($contract, $notes, $allowIdempotent) {
            if ($contract->status === 'vacated' && ! $allowIdempotent) {
                abort(422, 'Contract already vacated.');
            }

            $formattedNotes = trim(($contract->notes ? $contract->notes . "\n" : '') . ($notes ?? ''));

            $contract->update([
                'status' => 'vacated',
                'notes'  => $formattedNotes !== '' ? $formattedNotes : $contract->notes,
            ]);

            if ($contract->unit_id) {
                Unit::where('id', $contract->unit_id)->update(['status' => 'AVAILABLE']);
            }
        });
    }

    /**
     * Helper execution alias matching Paul's guide:
     * VacateContractService::execute(contract, notes): void
     */
    public static function execute(Contract $contract, ?string $notes = null): void
    {
        app(self::class)->vacate($contract, $notes, true);
    }
}
