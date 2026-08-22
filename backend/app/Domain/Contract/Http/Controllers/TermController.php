<?php

namespace App\Domain\Contract\Http\Controllers;

use App\Domain\Contract\Models\Term;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TermController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Term::query();

        if ($request->has('contract_id')) {
            $query->where('cid', $request->contract_id);
        }

        return response()->json(['status' => 'success', 'data' => ['terms' => $query->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cid'   => 'required|exists:contracts,id',
            'terms' => 'required|string',
        ]);

        $term = Term::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Terms saved.', 'data' => ['term' => $term]], 201);
    }

    public function show(Term $term): JsonResponse
    {
        return response()->json(['status' => 'success', 'data' => ['term' => $term]]);
    }

    public function update(Request $request, Term $term): JsonResponse
    {
        $validated = $request->validate([
            'terms' => 'required|string',
        ]);

        $term->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Terms updated.', 'data' => ['term' => $term]]);
    }

    public function destroy(Term $term): JsonResponse
    {
        $term->delete();

        return response()->json(['status' => 'success', 'message' => 'Terms deleted.']);
    }
}