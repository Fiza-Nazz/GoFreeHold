<?php

namespace App\Domain\Property\Http\Controllers;

use App\Domain\Property\Services\PropertyService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Vacant property / unit reporting (Module 3).
 */
class VacantPropertyController extends Controller
{
    public function __invoke(Request $request, PropertyService $propertyService): JsonResponse
    {
        $ownerId = null;
        $user = $request->user();
        if ($user && in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = app(\App\Domain\Auth\Services\OwnerContextResolver::class)->ownerId($user);
        }

        $units = $propertyService->vacantUnits($ownerId);

        return response()->json([
            'status' => 'success',
            'data'   => [
                'total_vacant' => $units->count(),
                'units'        => $units,
            ],
        ]);
    }
}
