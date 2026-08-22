<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Maintenance\Models\Job;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Contract\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComplaintController extends Controller
{
    /** Tenant's units from active contracts (for complaint form). */
    public function tenantUnits(Request $request)
    {
        $tenantId = Tenant::where('user_id', $request->user()->id)->value('id');
        if (!$tenantId) {
            return response()->json(['status' => 'success', 'data' => ['units' => []]]);
        }

        $units = Contract::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('status', ['active', 'renewed'])
            ->with(['unit:id,number,property_id', 'unit.property:id,name'])
            ->get()
            ->pluck('unit')
            ->filter()
            ->unique('id')
            ->values();

        return response()->json(['status' => 'success', 'data' => ['units' => $units]]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Complaint::with(['unit.property', 'tenant:id,name', 'job.assignedTo:id,name'])->latest();

        if ($user->role === 'tenant') {
            $tenantId = Tenant::where('user_id', $user->id)->value('id');
            $query->where('tenant_id', $tenantId);
        }

        if ($user->role === 'maintenance') {
            $query->where(function ($q) use ($user) {
                $q->whereHas('job', function ($jq) use ($user) {
                    $jq->where('assigned_to', $user->id);
                })->orWhere('status', 'open');
            });
        }

        return response()->json(['status' => 'success', 'data' => ['complaints' => $query->get()]]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id'     => 'required|exists:units,id',
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'category'    => 'nullable|string|max:100', // accepted for UI; not a DB column on complaints
            // Live complaints.priority enum is low|medium|high (no emergency).
            'priority'    => 'required|in:low,medium,high',
        ]);

        $tenant = Tenant::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'name'  => $request->user()->name,
                'email' => $request->user()->email,
            ]
        );

        unset($validated['category']);
        $validated['tenant_id'] = $tenant->id;
        $validated['status']    = 'open';

        $complaint = Complaint::create($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Complaint logged successfully.',
            'data'    => ['complaint' => $complaint->load(['unit.property'])],
        ], 201);
    }

    public function show(Complaint $complaint)
    {
        $complaint->load(['unit.property', 'tenant:id,name', 'job.assignedTo:id,name', 'job.assignedBy:id,name']);
        return response()->json(['status' => 'success', 'data' => ['complaint' => $complaint]]);
    }

    public function assign(Request $request, Complaint $complaint)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
            'team_id'     => 'nullable|exists:teams,id',
            'notes'       => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            $job = Job::updateOrCreate(
                ['complaint_id' => $complaint->id],
                [
                    'assigned_to'  => $validated['assigned_to'],
                    'assigned_by'  => $request->user()->id,
                    'team_id'      => $validated['team_id'] ?? null,
                    'status'       => 'assigned',
                    'notes'        => $validated['notes'] ?? null,
                ]
            );

            $complaint->update([
                'status'      => 'assigned',
                'assigned_to' => $validated['assigned_to'],
            ]);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Complaint assigned to technician.',
                'data'    => ['job' => $job->load('assignedTo:id,name')],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Failed to assign job.'], 500);
        }
    }

    public function updateStatus(Request $request, Complaint $complaint)
    {
        // Live complaints.status enum: open|assigned|in_progress|resolved (no closed, no resolved_at column).
        // Completion timestamp is tracked on jobs.completed_at.
        $validated = $request->validate([
            'status' => 'required|in:open,assigned,in_progress,resolved',
            'notes'  => 'nullable|string',
        ]);

        $jobStatus = match ($validated['status']) {
            'in_progress' => 'in_progress',
            'resolved'    => 'completed',
            'open'        => 'assigned',
            default       => 'assigned',
        };

        $complaint->update([
            'status'      => $validated['status'],
            // If maintenance staff moves an open ticket, claim it so queue filters stay consistent.
            'assigned_to' => $complaint->assigned_to ?: $request->user()->id,
        ]);

        // Tenant-created complaints often have no job yet — create/update so daily report can count completed_at.
        $existingJob = $complaint->job;
        $jobPayload = [
            'status'       => $jobStatus,
            'notes'        => $validated['notes'] ?? $existingJob?->notes,
            'completed_at' => ($jobStatus === 'completed') ? now() : null,
        ];

        if ($existingJob) {
            $existingJob->update($jobPayload);
            $job = $existingJob->fresh();
        } else {
            $job = Job::create([
                'complaint_id' => $complaint->id,
                'assigned_to'  => $request->user()->id,
                'assigned_by'  => $request->user()->id,
                ...$jobPayload,
            ]);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Complaint status updated.',
            'data'    => [
                'complaint' => $complaint->fresh()->load(['unit.property', 'tenant:id,name', 'job.assignedTo:id,name']),
                'job'       => $job,
            ],
        ]);
    }

    public function getTechnicians()
    {
        $techs = User::where('role', 'maintenance')->select('id', 'name', 'email')->get();
        return response()->json(['status' => 'success', 'data' => ['technicians' => $techs]]);
    }
}
