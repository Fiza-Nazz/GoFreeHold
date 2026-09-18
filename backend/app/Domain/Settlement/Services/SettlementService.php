<?php

namespace App\Domain\Settlement\Services;

use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Services\ContractVacateService;
use App\Domain\Settlement\Models\Settlement;
use App\Domain\Settlement\Models\SettlementDoc;
use App\Domain\Settlement\Models\SettlementPayment;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SettlementService
{
    public function __construct(private readonly ContractVacateService $vacateService)
    {
    }

    public function createSettlement(array $payload): Settlement
    {
        $contract = Contract::with('unit')->findOrFail($payload['contract_id']);
        if ($contract->status !== 'active') {
            throw ValidationException::withMessages([
                'contract_id' => ['Settlement must be linked to a currently active contract.'],
            ]);
        }

        $ownerId = $contract->owner_id;
        if (! $ownerId) {
            throw ValidationException::withMessages([
                'owner_id' => ['No owner profile found for this contract\'s owner. Create an owner profile first.'],
            ]);
        }

        if (isset($payload['owner_id']) && (int) $payload['owner_id'] !== (int) $ownerId) {
            throw ValidationException::withMessages([
                'owner_id' => ['The settlement owner must match the selected contract owner.'],
            ]);
        }

        $status = $payload['status'] ?? 'pending';

        return DB::transaction(function () use ($payload, $contract, $ownerId, $status) {
            $settlement = Settlement::create([
                'owner_id' => $ownerId,
                'contract_id' => $contract->id,
                'vacant_date' => $payload['vacant_date'],
                'dues' => $payload['dues'],
                'receivable' => $payload['receivable'],
                'on_case' => $payload['on_case'] ?? false,
                'status' => $status,
            ]);

            if ($status === 'completed') {
                $this->vacateService->vacate(
                    $contract,
                    'Vacated via settlement #' . $settlement->id . ' completion',
                );
            }

            return $settlement;
        });
    }

    public function updateSettlement(Settlement $settlement, array $payload): Settlement
    {
        // Documents and payments must remain attached to their original contract.
        if (array_key_exists('contract_id', $payload)
            && (int) $payload['contract_id'] !== (int) $settlement->contract_id) {
            throw ValidationException::withMessages([
                'contract_id' => ['An existing settlement cannot be moved to another contract.'],
            ]);
        }

        $wasCompleted = $settlement->status === 'completed';

        DB::transaction(function () use ($settlement, $payload, $wasCompleted) {
            $settlement->update($payload);
            $settlement->refresh();

            if (! $wasCompleted && $settlement->status === 'completed') {
                if (! $settlement->contract_id) {
                    throw ValidationException::withMessages([
                        'contract_id' => ['Cannot complete settlement without a linked active contract.'],
                    ]);
                }

                $contract = Contract::findOrFail($settlement->contract_id);
                $this->vacateService->vacate(
                    $contract,
                    'Vacated via settlement #' . $settlement->id . ' completion',
                );
            }
        });

        return $settlement->fresh();
    }

    public function recordPayment(array $payload): SettlementPayment
    {
        return SettlementPayment::create($payload);
    }

    public function storeDocument(int $settlementId, UploadedFile $file): SettlementDoc
    {
        $path = $file->store('settlement-docs', 'public');

        return SettlementDoc::create([
            'settlement_id' => $settlementId,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
        ]);
    }

    public function deleteDocument(SettlementDoc $settlementDoc): void
    {
        if ($settlementDoc->file_path) {
            Storage::disk('public')->delete($settlementDoc->file_path);
        }

        $settlementDoc->delete();
    }
}
