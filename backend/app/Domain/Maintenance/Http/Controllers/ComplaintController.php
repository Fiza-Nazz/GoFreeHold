<?php

namespace App\Domain\Maintenance\Http\Controllers;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\OwnerStaff;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Contract\Models\Contract;
use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Maintenance\Services\ComplaintWorkflowService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    public function __construct(
        private readonly ComplaintWorkflowService $workflowService,
        private readonly OwnerContextResolver $contextResolver
    ) {
    }

    /**
     * Tenant's units from active or renewed contracts (for complaint form).
     */
    public function tenantUnits(Request $request): JsonResponse
    {
        $tenantId = Tenant::where('user_id', $request->user()->id)->value('id');
        if (!$tenantId) {
            return response()->json(['status' => 'success', 'data' => ['units' => []]]);
        }

        $units = Contract::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('status', ['active', 'renewed'])
            ->with(['unit:id,number,property_id', 'unit.property:id,name,address'])
            ->get()
            ->pluck('unit')
            ->filter()
            ->unique('id')
            ->values();

        return response()->json(['status' => 'success', 'data' => ['units' => $units]]);
    }

    /**
     * List complaints scoped by role.
     * - Tenant: own complaints
     * - Owner/Staff: full organization queue
     * - Maintenance: full organization queue (supervisor); ?mine=1 filters to assigned_to = me
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Complaint::query()
            ->with([
                'unit:id,number,property_id,owner_id',
                'unit.property:id,name,address,city,owner_id',
                'tenant:id,name,email,phone',
                'job.assignedTo:id,name,email',
                'job.assignedBy:id,name',
                'attachments',
                'updates.user:id,name',
            ])
            ->latest('id');

        if ($user->role === 'tenant') {
            $tenantId = Tenant::where('user_id', $user->id)->value('id');
            if (!$tenantId) {
                return response()->json(['status' => 'success', 'data' => ['complaints' => []]]);
            }
            $query->where('tenant_id', $tenantId);
        } elseif (in_array($user->role, ['owner', 'cashier', 'accountant'], true)) {
            $ownerId = $this->resolveOwnerId($user);
            $query->whereHas('unit', function ($u) use ($ownerId) {
                $u->where('units.owner_id', $ownerId)
                  ->orWhereHas('property', fn ($p) => $p->where('owner_id', $ownerId));
            });
        } elseif ($user->role === 'maintenance') {
            $ownerId = $this->resolveOwnerId($user);
            $query->whereHas('unit', function ($u) use ($ownerId) {
                $u->where('units.owner_id', $ownerId)
                  ->orWhereHas('property', fn ($p) => $p->where('owner_id', $ownerId));
            });

            // Optional ?mine=1 filter for personal work queue
            if ($request->boolean('mine') || $request->get('assigned_to') === 'me') {
                $query->where('assigned_to', $user->id);
            }
        }

        // Common query filters
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->get('priority'));
        }

        if ($request->filled('category')) {
            $query->where('category', $request->get('category'));
        }

        if ($request->filled('search')) {
            $search = '%' . trim($request->get('search')) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                  ->orWhere('description', 'like', $search)
                  ->orWhereHas('unit', fn ($u) => $u->where('number', 'like', $search));
            });
        }

        return response()->json([
            'status' => 'success',
            'data'   => ['complaints' => $query->get()],
        ]);
    }

    /**
     * Create complaint (tenant or staff).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'unit_id'     => 'required|exists:units,id',
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'category'    => 'required|string|max:100',
            'priority'    => 'required|in:low,medium,high',
            'photos'      => 'nullable|array|max:3',
            'photos.*'    => 'file|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $photos = $request->file('photos') ?? [];
        if (!is_array($photos)) {
            $photos = [$photos];
        }

        $complaint = $this->workflowService->create($validated, $request->user(), $photos);

        return response()->json([
            'status'  => 'success',
            'message' => 'Complaint logged successfully.',
            'data'    => ['complaint' => $complaint],
        ], 201);
    }

    /**
     * Show complaint details with attachments, updates, and job.
     */
    public function show(Request $request, Complaint $complaint): JsonResponse
    {
        $this->authorizeAccess($request->user(), $complaint);

        $complaint->load([
            'unit:id,number,property_id,owner_id',
            'unit.property:id,name,address,city,owner_id',
            'tenant:id,name,email,phone',
            'job.assignedTo:id,name,email',
            'job.assignedBy:id,name',
            'attachments',
            'updates.user:id,name',
        ]);

        return response()->json([
            'status' => 'success',
            'data'   => ['complaint' => $complaint],
        ]);
    }

    /**
     * Assign complaint to technician and schedule.
     */
    public function assign(Request $request, Complaint $complaint): JsonResponse
    {
        $user = $request->user();
        if ($user->role === 'tenant') {
            abort(403, 'Tenants cannot assign maintenance complaints.');
        }

        $this->authorizeAccess($user, $complaint);

        $validated = $request->validate([
            'assigned_to'    => 'required|exists:users,id',
            'team_id'        => 'nullable|exists:teams,id',
            'scheduled_date' => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $job = $this->workflowService->assign($complaint, $validated, $user);

        return response()->json([
            'status'  => 'success',
            'message' => 'Complaint assigned to technician.',
            'data'    => ['job' => $job],
        ]);
    }

    /**
     * Update complaint status.
     */
    public function updateStatus(Request $request, Complaint $complaint): JsonResponse
    {
        $user = $request->user();
        if ($user->role === 'tenant') {
            abort(403, 'Tenants cannot update maintenance complaint status.');
        }

        $this->authorizeAccess($user, $complaint);

        $validated = $request->validate([
            'status' => 'required|in:open,assigned,in_progress,resolved',
            'notes'  => 'nullable|string',
        ]);

        $updatedComplaint = $this->workflowService->transition(
            $complaint,
            $validated['status'],
            $validated['notes'] ?? null,
            $user
        );

        return response()->json([
            'status'  => 'success',
            'message' => 'Complaint status updated.',
            'data'    => [
                'complaint' => $updatedComplaint,
                'job'       => $updatedComplaint->job,
            ],
        ]);
    }

    /**
     * Upload photo attachments to an existing complaint.
     */
    public function storeAttachments(Request $request, Complaint $complaint): JsonResponse
    {
        $this->authorizeAccess($request->user(), $complaint);

        $request->validate([
            'photos'   => 'required|array|min:1|max:3',
            'photos.*' => 'file|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $photos = $request->file('photos') ?? [];
        if (!is_array($photos)) {
            $photos = [$photos];
        }

        $attachments = $this->workflowService->addAttachments($complaint, $photos, $request->user());

        return response()->json([
            'status'  => 'success',
            'message' => 'Photos uploaded successfully.',
            'data'    => ['attachments' => $attachments],
        ]);
    }

    /**
     * Get technicians in the same organization.
     */
    public function getTechnicians(Request $request): JsonResponse
    {
        $user = $request->user();
        $ownerId = $this->resolveOwnerId($user);

        $query = User::query()
            ->where('role', 'maintenance')
            ->where('account_status', 'active');

        if ($ownerId) {
            $query->whereHas('staffMembership', fn ($q) => $q->where('owner_id', $ownerId));
        }

        $technicians = $query->select('id', 'name', 'email')->get();

        return response()->json([
            'status' => 'success',
            'data'   => ['technicians' => $technicians],
        ]);
    }

    /**
     * Enforce role-based organization / ownership isolation.
     * Reject cross-tenant or cross-organization complaints with 404 (do not leak existence).
     */
    private function authorizeAccess(User $user, Complaint $complaint): void
    {
        if ($user->role === 'admin') {
            return;
        }

        if ($user->role === 'tenant') {
            $tenantId = Tenant::where('user_id', $user->id)->value('id');
            if (!$tenantId || (int) $complaint->tenant_id !== (int) $tenantId) {
                abort(404, 'Complaint not found.');
            }
            return;
        }

        $ownerId = $this->resolveOwnerId($user);
        $complaintOwnerId = (int) ($complaint->unit?->property?->owner_id ?? $complaint->unit?->owner_id);

        if (!$ownerId || $complaintOwnerId !== (int) $ownerId) {
            abort(404, 'Complaint not found.');
        }
    }

    /**
     * Helper to resolve owner ID.
     */
    private function resolveOwnerId(User $user): ?int
    {
        if ($user->role === 'owner') {
            return Owner::where('user_id', $user->id)->value('id');
        }

        if (in_array($user->role, ['cashier', 'accountant', 'maintenance'], true)) {
            return OwnerStaff::where('user_id', $user->id)->value('owner_id');
        }

        return null;
    }
}
