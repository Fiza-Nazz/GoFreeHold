<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\LegalCase;
use App\Domain\Contract\Models\LegalCaseDocument;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LegalCaseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', LegalCase::class);

        $query = LegalCase::with([
            'contract:id,unit_id,tenant_id,owner_id,status,on_case',
            'contract.unit:id,number,property_id',
            'contract.unit.property:id,name',
            'contract.tenant:id,name',
            'settlement:id,contract_id,status,vacant_date',
            'documents',
        ])->latest();

        if ($request->filled('contract_id')) {
            $query->where('contract_id', $request->integer('contract_id'));
        }
        if ($request->filled('settlement_id')) {
            $query->where('settlement_id', $request->integer('settlement_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'status' => 'success',
            'data'   => ['legal_cases' => $query->get()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', LegalCase::class);

        $validated = $request->validate([
            'contract_id'   => 'nullable|exists:contracts,id',
            'settlement_id' => 'nullable|exists:settlements,id',
            'status'        => ['required', Rule::in(['open', 'in_progress', 'closed'])],
            'notes'         => 'nullable|string',
        ]);

        if (empty($validated['contract_id']) && empty($validated['settlement_id'])) {
            return response()->json([
                'status'  => 'error',
                'message' => 'A legal case must be linked to a contract and/or a settlement.',
                'errors'  => [
                    'contract_id' => ['Link at least a contract or a settlement.'],
                ],
            ], 422);
        }

        $case = LegalCase::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Legal case created.',
            'data'    => [
                'legal_case' => $case->load([
                    'contract.unit.property',
                    'contract.tenant:id,name',
                    'settlement',
                    'documents',
                ]),
            ],
        ], 201);
    }

    public function show(LegalCase $legalCase): JsonResponse
    {
        $this->authorize('view', $legalCase);

        $legalCase->load([
            'contract.unit.property',
            'contract.tenant:id,name',
            'contract.owner:id,name',
            'settlement',
            'documents',
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => ['legal_case' => $legalCase],
        ]);
    }

    public function update(Request $request, LegalCase $legalCase): JsonResponse
    {
        $this->authorize('update', $legalCase);

        $validated = $request->validate([
            'contract_id'   => 'sometimes|nullable|exists:contracts,id',
            'settlement_id' => 'sometimes|nullable|exists:settlements,id',
            'status'        => ['sometimes', Rule::in(['open', 'in_progress', 'closed'])],
            'notes'         => 'sometimes|nullable|string',
        ]);

        $legalCase->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Legal case updated.',
            'data'    => [
                'legal_case' => $legalCase->fresh([
                    'contract.unit.property',
                    'contract.tenant:id,name',
                    'settlement',
                    'documents',
                ]),
            ],
        ]);
    }

    public function destroy(LegalCase $legalCase): JsonResponse
    {
        $this->authorize('delete', $legalCase);

        foreach ($legalCase->documents as $doc) {
            Storage::disk('public')->delete($doc->file_path);
        }

        $legalCase->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Legal case deleted.',
        ]);
    }

    public function storeDocument(Request $request, LegalCase $legalCase): JsonResponse
    {
        $this->authorize('update', $legalCase);

        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('legal-case-docs', 'public');

        $doc = LegalCaseDocument::create([
            'legal_case_id' => $legalCase->id,
            'file_name'     => $file->getClientOriginalName(),
            'file_path'     => $path,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Case document uploaded.',
            'data'    => ['document' => $doc],
        ], 201);
    }

    public function destroyDocument(LegalCase $legalCase, LegalCaseDocument $legalCaseDocument): JsonResponse
    {
        $this->authorize('update', $legalCase);

        if ((int) $legalCaseDocument->legal_case_id !== (int) $legalCase->id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Document does not belong to this legal case.',
            ], 404);
        }

        Storage::disk('public')->delete($legalCaseDocument->file_path);
        $legalCaseDocument->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Case document deleted.',
        ]);
    }
}
