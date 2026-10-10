<?php

namespace App\Domain\Platform\Http\Controllers;

use App\Domain\Platform\Services\ImpersonationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImpersonationController extends Controller
{
    /**
     * POST /admin/impersonations
     */
    public function start(Request $request, ImpersonationService $service): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $result = $service->start($request->user(), (int) $validated['user_id']);

        return response()->json([
            'data' => $result,
        ]);
    }

    /**
     * POST /admin/impersonations/exit
     */
    public function exit(Request $request, ImpersonationService $service): JsonResponse
    {
        $result = $service->exit($request);

        return response()->json([
            'data' => $result,
        ]);
    }
}
