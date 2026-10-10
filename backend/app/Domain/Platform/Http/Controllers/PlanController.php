<?php

namespace App\Domain\Platform\Http\Controllers;

use App\Domain\Platform\Models\SubscriptionPlan;
use App\Domain\Platform\Services\AuditService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    /**
     * GET /admin/plans
     */
    public function index(): JsonResponse
    {
        $plans = SubscriptionPlan::orderBy('price_monthly')->get();

        return response()->json([
            'data' => [
                'plans' => $plans,
            ],
        ]);
    }

    /**
     * POST /admin/plans
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'code'           => 'required|string|max:100|unique:subscription_plans,code',
            'price_monthly'  => 'required|numeric|min:0',
            'max_properties' => 'nullable|integer|min:0',
            'max_units'      => 'nullable|integer|min:0',
            'max_users'      => 'nullable|integer|min:0',
            'features'       => 'nullable|array',
            'is_active'      => 'nullable|boolean',
        ]);

        $plan = SubscriptionPlan::create($validated);

        AuditService::log('plan.created', 'plan', $plan->id, ['code' => $plan->code, 'price' => $plan->price_monthly]);

        return response()->json([
            'data' => [
                'plan' => $plan,
            ],
        ], 201);
    }

    /**
     * PUT /admin/plans/{id}
     */
    public function update(Request $request, SubscriptionPlan $plan): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'code'           => 'sometimes|string|max:100|unique:subscription_plans,code,' . $plan->id,
            'price_monthly'  => 'sometimes|numeric|min:0',
            'max_properties' => 'sometimes|integer|min:0',
            'max_units'      => 'sometimes|integer|min:0',
            'max_users'      => 'sometimes|integer|min:0',
            'features'       => 'sometimes|nullable|array',
            'is_active'      => 'sometimes|boolean',
        ]);

        $plan->update($validated);

        AuditService::log('plan.updated', 'plan', $plan->id, $validated);

        return response()->json([
            'data' => [
                'plan' => $plan,
            ],
        ]);
    }
}
