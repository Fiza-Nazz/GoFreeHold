<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Property\Services\PropertyService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Vacant property / unit reporting (Module 3).
 */
class VacantPropertyController extends Controller
{
    public function __invoke(PropertyService $propertyService): JsonResponse
    {
        $units = $propertyService->vacantUnits();

        return response()->json([
            'status' => 'success',
            'data'   => [
                'total_vacant' => $units->count(),
                'units'        => $units,
            ],
        ]);
    }
}
