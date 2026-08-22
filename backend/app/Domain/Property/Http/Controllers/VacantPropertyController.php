<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Property\Models\Unit;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Vacant property / unit reporting (Module 3).
 */
class VacantPropertyController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $units = Unit::with('property:id,name', 'owner:id,name')
            ->where('status', 'AVAILABLE')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'total_vacant' => $units->count(),
                'units'        => $units,
            ],
        ]);
    }
}
