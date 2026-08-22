<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Auth\Models\Owner;
use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Services\ContractVacateService;
use App\Domain\Settlement\Models\Settlement;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SettlementController extends Controller
{
    public function __construct(private readonly ContractVacateService $vacateService)
    {
    }

    public function index(): JsonResponse
    {
        $settlements = Settlement::with([
            'owner:id,name,email',
            'contract:id,unit_id,tenant_id,owner_id,status,rent_amount',
            'contract.unit:id,number,property_id,status',
            'contract.unit.property:id,name',
            'contract.tenant:id,name',
            'docs',
            'payments',
        ])->latest()->get();

        return response()->json(['status' => 'success', 'data' => ['settlements' => $settlements]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'owner_id'    => 'nullable|exists:owners,id',
            'vacant_date' => 'required|date',
            'dues'        => 'required|numeric|min:0',
            'receivable'  => 'required|numeric|min:0',
            'on_case'     => 'nullable|boolean',
            'status'      => 'nullable|in:pending,completed',
        ]);

        $contract = Contract::with('unit')->findOrFail($validated['contract_id']);
        if ($contract->status !== 'active') {
            throw ValidationException::withMessages([
                'contract_id' => ['Settlement must be linked to a currently active contract.'],
            ]);
        }

        $ownerId = $validated['owner_id'] ?? null;
        if (! $ownerId) {
            $ownerId = Owner::where('user_id', $contract->owner_id)->value('id');
        }
        if (! $ownerId) {
            throw ValidationException::withMessages([
                'owner_id' => ['No owner profile found for this contract\'s owner. Create an owner profile first.'],
            ]);
        }

        $status = $validated['status'] ?? 'pending';

        $settlement = DB::transaction(function () use ($validated, $contract, $ownerId, $status) {
            $settlement = Settlement::create([
                'owner_id'    => $ownerId,
                'contract_id' => $contract->id,
                'vacant_date' => $validated['vacant_date'],
                'dues'        => $validated['dues'],
                'receivable'  => $validated['receivable'],
                'on_case'     => $validated['on_case'] ?? false,
                'status'      => $status,
            ]);

            if ($status === 'completed') {
                $this->vacateService->vacate(
                    $contract,
                    'Vacated via settlement #' . $settlement->id . ' completion'
                );
            }

            return $settlement;
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Settlement created.',
            'data'    => [
                'settlement' => $settlement->load([
                    'owner:id,name,email',
                    'contract.unit.property',
                    'contract.tenant:id,name',
                    'docs',
                    'payments',
                ]),
            ],
        ], 201);
    }

    public function show(Settlement $settlement): JsonResponse
    {
        $settlement->load([
            'owner',
            'contract.unit.property',
            'contract.tenant',
            'docs',
            'payments',
        ]);

        return response()->json(['status' => 'success', 'data' => ['settlement' => $settlement]]);
    }

    public function update(Request $request, Settlement $settlement): JsonResponse
    {
        $validated = $request->validate([
            'vacant_date' => 'sometimes|date',
            'dues'        => 'sometimes|numeric|min:0',
            'receivable'  => 'sometimes|numeric|min:0',
            'on_case'     => 'sometimes|boolean',
            'status'      => 'sometimes|in:pending,completed',
            'contract_id' => 'sometimes|nullable|exists:contracts,id',
        ]);

        $wasCompleted = $settlement->status === 'completed';

        DB::transaction(function () use ($settlement, $validated, $wasCompleted) {
            $settlement->update($validated);
            $settlement->refresh();

            // Only trigger vacate when transitioning INTO completed (not on re-save)
            if (! $wasCompleted && $settlement->status === 'completed') {
                if (! $settlement->contract_id) {
                    throw ValidationException::withMessages([
                        'contract_id' => ['Cannot complete settlement without a linked active contract.'],
                    ]);
                }
                $contract = Contract::findOrFail($settlement->contract_id);
                $this->vacateService->vacate(
                    $contract,
                    'Vacated via settlement #' . $settlement->id . ' completion'
                );
            }
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Settlement updated.',
            'data'    => [
                'settlement' => $settlement->fresh([
                    'owner:id,name,email',
                    'contract.unit.property',
                    'contract.tenant:id,name',
                    'docs',
                    'payments',
                ]),
            ],
        ]);
    }

    public function destroy(Settlement $settlement): JsonResponse
    {
        $settlement->delete();

        return response()->json(['status' => 'success', 'message' => 'Settlement record removed.']);
    }

    public function setOnCase(Request $request, Settlement $settlement): JsonResponse
    {
        $validated = $request->validate([
            'on_case' => 'required|boolean',
        ]);

        $settlement->update(['on_case' => $validated['on_case']]);

        return response()->json([
            'status'  => 'success',
            'message' => $validated['on_case'] ? 'Settlement marked as on case.' : 'Settlement removed from on case.',
            'data'    => ['settlement' => $settlement],
        ]);
    }
}
