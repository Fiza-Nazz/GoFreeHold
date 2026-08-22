<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Property\Models\BookingCashReceipt;
use App\Domain\Property\Models\Unit;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    /**
     * Advance booking with daily cash receipt recording (prompt.md Module 3).
     * Receipt is persisted inside the same DB transaction as the unit status change.
     */
    public function bookUnit(Request $request): JsonResponse
    {
        $this->authorize('book', Unit::class);

        $validated = $request->validate([
            'unit_id'     => 'required|exists:units,id',
            'tenant_name' => 'required|string|max:255',
            'amount'      => 'required|numeric|min:1',
            'notes'       => 'nullable|string',
        ]);

        try {
            $result = DB::transaction(function () use ($request, $validated) {
                /** @var Unit $unit */
                $unit = Unit::query()->lockForUpdate()->findOrFail($validated['unit_id']);

                if ($unit->status !== 'AVAILABLE') {
                    throw ValidationException::withMessages([
                        'unit_id' => ['Unit is not available for booking.'],
                    ]);
                }

                $unit->status = 'BOOKED';
                $unit->save();

                // Unique receipt number generated inside the open transaction, then saved
                do {
                    $receiptNumber = 'REC-' . now()->format('YmdHis') . '-' . random_int(100, 999);
                } while (BookingCashReceipt::where('receipt_number', $receiptNumber)->lockForUpdate()->exists());

                $receipt = BookingCashReceipt::create([
                    'unit_id'        => $unit->id,
                    'receipt_number' => $receiptNumber,
                    'tenant_name'    => $validated['tenant_name'],
                    'amount'         => $validated['amount'],
                    'receipt_date'   => now()->toDateString(),
                    'notes'          => $validated['notes'] ?? null,
                    'recorded_by'    => $request->user()?->id,
                ]);

                return [$unit->fresh(), $receipt];
            });
        } catch (ValidationException $e) {
            $message = collect($e->errors())->flatten()->first() ?: 'Unit is not available for booking.';

            return response()->json([
                'status'  => 'error',
                'message' => $message,
                'errors'  => $e->errors(),
            ], 400);
        } catch (\Throwable $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Failed to process booking.',
            ], 500);
        }

        [$unit, $receipt] = $result;

        return response()->json([
            'status'  => 'success',
            'message' => 'Unit successfully booked and cash receipt generated.',
            'data'    => [
                'unit'    => $unit,
                'receipt' => [
                    'id'             => $receipt->id,
                    'receipt_number' => $receipt->receipt_number,
                    'amount'         => $receipt->amount,
                    'tenant_name'    => $receipt->tenant_name,
                    'date'           => $receipt->receipt_date?->toDateString(),
                    'notes'          => $receipt->notes,
                ],
            ],
        ]);
    }

    /**
     * List persisted booking cash receipts (admin).
     */
    public function indexReceipts(): JsonResponse
    {
        $this->authorize('viewAny', Unit::class);

        $receipts = BookingCashReceipt::with(['unit:id,number,property_id,status', 'unit.property:id,name'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => ['receipts' => $receipts],
        ]);
    }

    /**
     * Show one persisted booking cash receipt.
     */
    public function showReceipt(BookingCashReceipt $bookingCashReceipt): JsonResponse
    {
        $this->authorize('view', $bookingCashReceipt->unit);

        $bookingCashReceipt->load(['unit.property', 'recordedBy:id,name,email']);

        return response()->json([
            'status' => 'success',
            'data'   => ['receipt' => $bookingCashReceipt],
        ]);
    }
}
