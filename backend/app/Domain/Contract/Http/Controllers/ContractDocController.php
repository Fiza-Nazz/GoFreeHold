<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\ContractDoc;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContractDocController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ContractDoc::with('contract:id,unit_id,tenant_id');

        if ($request->has('contract_id')) {
            $query->where('contract_id', $request->contract_id);
        }

        return response()->json(['status' => 'success', 'data' => ['docs' => $query->latest()->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'file'        => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('contract-docs', 'public');

        $doc = ContractDoc::create([
            'contract_id' => $validated['contract_id'],
            'file_name'   => $file->getClientOriginalName(),
            'file_path'   => $path,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Document uploaded.', 'data' => ['doc' => $doc]], 201);
    }

    public function destroy(ContractDoc $contractDoc): JsonResponse
    {
        Storage::disk('public')->delete($contractDoc->file_path);
        $contractDoc->delete();

        return response()->json(['status' => 'success', 'message' => 'Document deleted.']);
    }
}