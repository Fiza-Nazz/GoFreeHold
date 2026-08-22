<?php

namespace App\Domain\Settlement\Http\Controllers;

use App\Domain\Settlement\Models\Category;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json(['status' => 'success', 'data' => ['categories' => $query->get()]]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
        ]);

        $category = Category::create($validated);

        return response()->json(['status' => 'success', 'message' => 'Category created.', 'data' => ['category' => $category]], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'in:income,expense',
        ]);

        $category->update($validated);

        return response()->json(['status' => 'success', 'message' => 'Category updated.', 'data' => ['category' => $category]]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(['status' => 'success', 'message' => 'Category deleted.']);
    }
}