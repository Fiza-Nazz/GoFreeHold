<?php

namespace App\Domain\Platform\Http\Controllers;

use App\Domain\Platform\Models\AuditLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * GET /admin/audit-logs
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::with([
            'actor:id,name,email',
            'organization:id,name',
        ]);

        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->actor_id);
        }

        if ($request->filled('action')) {
            $query->where('action', 'like', "%{$request->action}%");
        }

        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->to);
        }

        $logs = $query->orderByDesc('id')->take(100)->get();

        return response()->json([
            'data' => [
                'audit_logs' => $logs,
            ],
        ]);
    }
}
