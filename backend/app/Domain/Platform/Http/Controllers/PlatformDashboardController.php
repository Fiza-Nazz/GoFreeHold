<?php

namespace App\Domain\Platform\Http\Controllers;

use App\Domain\Platform\Services\PlatformDashboardService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PlatformDashboardController extends Controller
{
    /**
     * GET /admin/dashboard
     * Platform KPI summary across all customer organizations.
     */
    public function index(PlatformDashboardService $service): JsonResponse
    {
        return response()->json([
            'data' => $service->getStats(),
        ]);
    }
}
