<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\SettlementDoc;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettlementDocController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SettlementDoc::query();

        if ($request->has('settlement_id')) {
            $query->where('settlement_id', $request->settlement_id);
        }

        return response()->json(['status' => 'success', 'data' => ['docs' => $query->latest()->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settlement_id' => 'required|exists:settlements,id',
            'file'          => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('settlement-docs', 'public');

        $doc = SettlementDoc::create([
            'settlement_id' => $validated['settlement_id'],
            'file_name'     => $file->getClientOriginalName(),
            'file_path'     => $path,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Settlement document uploaded.', 'data' => ['doc' => $doc]], 201);
    }

    public function destroy(SettlementDoc $settlementDoc): JsonResponse
    {
        if ($settlementDoc->file_path) {
            Storage::disk('public')->delete($settlementDoc->file_path);
        }
        $settlementDoc->delete();

        return response()->json(['status' => 'success', 'message' => 'Settlement document deleted.']);
    }
}