<?php

namespace App\Domain\Payment\Http\Controllers;

use App\Domain\Payment\Models\ServiceCharge;
use App\Domain\Payment\Models\ServiceChargeDoc;
use App\Domain\Payment\Services\ServiceChargeService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ServiceChargeDocController extends Controller
{
    public function __construct(private readonly ServiceChargeService $service)
    {
    }

    /**
     * List documents attached to service charges.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = ServiceChargeDoc::with('uploader:id,name');

        if ($request->filled('service_charge_id')) {
            $charge = ServiceCharge::findOrFail((int) $request->service_charge_id);
            $this->service->assertChargeAccess($charge, $user);
            $query->where('service_charge_id', $charge->id);
        } else {
            $chargeIds = ServiceCharge::query();
            $this->service->scopeCharges($chargeIds, $user);
            $query->whereIn('service_charge_id', $chargeIds->select('id'));
        }

        return response()->json([
            'status' => 'success',
            'data'   => [
                'docs' => $query->latest()->get(),
            ],
        ]);
    }

    /**
     * Upload an OA/PM invoice document for a service charge.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'service_charge_id' => 'required|integer|exists:service_charges,id',
            'file'              => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png',
            'doc_type'          => 'nullable|string|max:50',
        ]);

        $charge = ServiceCharge::findOrFail((int) $validated['service_charge_id']);
        $this->service->assertChargeAccess($charge, $user);

        $doc = $this->service->storeDoc(
            $charge,
            $request->file('file'),
            $validated['doc_type'] ?? 'oa_invoice',
            $user->id
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Service charge document uploaded successfully.',
            'data'    => [
                'doc' => $doc->load('uploader:id,name'),
            ],
        ], 201);
    }

    /**
     * Download a service charge document securely.
     */
    public function download(Request $request, int $id)
    {
        $user = $request->user();
        $doc = ServiceChargeDoc::with('serviceCharge')->findOrFail($id);

        if ($doc->serviceCharge) {
            $this->service->assertChargeAccess($doc->serviceCharge, $user);
        }

        if (Storage::disk('local')->exists($doc->file_path)) {
            return Storage::disk('local')->download($doc->file_path, $doc->file_name);
        }

        if (Storage::disk('public')->exists($doc->file_path)) {
            return Storage::disk('public')->download($doc->file_path, $doc->file_name);
        }

        abort(404, 'File not found on disk.');
    }

    /**
     * Delete a service charge document.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $doc = ServiceChargeDoc::with('serviceCharge')->findOrFail($id);

        if ($doc->serviceCharge) {
            $this->service->assertChargeAccess($doc->serviceCharge, $user);
        }

        $this->service->deleteDoc($doc);

        return response()->json([
            'status'  => 'success',
            'message' => 'Service charge document deleted.',
        ]);
    }
}
