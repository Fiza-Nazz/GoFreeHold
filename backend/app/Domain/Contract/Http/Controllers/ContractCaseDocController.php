<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\Contract;
use App\Domain\Contract\Models\ContractCaseDoc;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContractCaseDocController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ContractCaseDoc::with('contract:id,unit_id,tenant_id,on_case');

        if ($request->has('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }

        return response()->json(['status' => 'success', 'data' => ['docs' => $query->latest()->get()]]);
    }

    public function indexForContract(Contract $contract): JsonResponse
    {
        $docs = $contract->caseDocs()->latest()->get();

        return response()->json(['status' => 'success', 'data' => ['docs' => $docs]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'file'        => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('contract-case-docs', 'public');

        $doc = ContractCaseDoc::create([
            'contract_id' => $validated['contract_id'],
            'file_name'   => $file->getClientOriginalName(),
            'file_path'   => $path,
        ]);

        Contract::where('id', $validated['contract_id'])->update(['on_case' => true]);

        return response()->json(['status' => 'success', 'message' => 'Case document uploaded.', 'data' => ['doc' => $doc]], 201);
    }

    public function storeForContract(Request $request, Contract $contract): JsonResponse
    {
        $request->validate(['file' => 'required|file|max:10240']);

        $file = $request->file('file');
        $path = $file->store('contract-case-docs', 'public');

        $doc = ContractCaseDoc::create([
            'contract_id' => $contract->id,
            'file_name'   => $file->getClientOriginalName(),
            'file_path'   => $path,
        ]);

        $contract->update(['on_case' => true]);

        return response()->json(['status' => 'success', 'message' => 'Case document uploaded.', 'data' => ['doc' => $doc]], 201);
    }

    public function destroy(ContractCaseDoc $contractCaseDoc): JsonResponse
    {
        Storage::disk('public')->delete($contractCaseDoc->file_path);
        $contractCaseDoc->delete();

        return response()->json(['status' => 'success', 'message' => 'Case document deleted.']);
    }

    public function destroyForContract(Contract $contract, ContractCaseDoc $contractCaseDoc): JsonResponse
    {
        if ($contractCaseDoc->contract_id !== $contract->id) {
            return response()->json(['status' => 'error', 'message' => 'Document does not belong to this contract.'], 404);
        }

        Storage::disk('public')->delete($contractCaseDoc->file_path);
        $contractCaseDoc->delete();

        return response()->json(['status' => 'success', 'message' => 'Case document deleted.']);
    }
}