<?php

namespace App\Domain\Platform\Http\Controllers;

use App\Domain\Platform\Models\Subscription;
use App\Domain\Platform\Services\AuditService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    /**
     * GET /admin/subscriptions
     */
    public function index(Request $request): JsonResponse
    {
        $query = Subscription::with(['organization:id,name,status', 'plan:id,name,price_monthly']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        $subscriptions = $query->orderByDesc('id')->get();

        return response()->json([
            'data' => [
                'subscriptions' => $subscriptions,
            ],
        ]);
    }

    /**
     * PUT /admin/subscriptions/{id}
     */
    public function update(Request $request, Subscription $subscription): JsonResponse
    {
        $validated = $request->validate([
            'plan_id'   => 'sometimes|nullable|exists:subscription_plans,id',
            'status'    => 'sometimes|string|in:trial,active,suspended,cancelled',
            'starts_at' => 'sometimes|nullable|date',
            'ends_at'   => 'sometimes|nullable|date',
        ]);

        $subscription->update($validated);

        // Sync with organization's plan_id if updated
        if (isset($validated['plan_id'])) {
            $subscription->organization?->update(['plan_id' => $validated['plan_id']]);
        }

        AuditService::log(
            'subscription.updated',
            'subscription',
            $subscription->id,
            $validated,
            $subscription->organization_id
        );

        $subscription->load(['organization:id,name,status', 'plan:id,name,price_monthly']);

        return response()->json([
            'data' => [
                'subscription' => $subscription,
            ],
        ]);
    }
}
