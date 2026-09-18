<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\Job;
use App\Domain\Maintenance\Services\MaintenanceStatusService;
use Illuminate\Http\Request;

/**
 * Dedicated maintenance jobs CRUD (real schema: jobs table).
 */
class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::with([
            'team:id,name',
            'complaint:id,title,status,unit_id',
            'assignedTo:id,name',
        ]);

        if ($request->filled('team_id')) {
            $query->where('team_id', $request->team_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'status' => 'success',
            'data'   => ['jobs' => $query->latest()->get()],
        ]);
    }

    public function store(Request $request)
    {
        // Real schema: complaint_id is NOT NULL (no default)
        $validated = $request->validate([
            'complaint_id'   => 'required|exists:complaints,id',
            'team_id'        => 'nullable|exists:teams,id',
            'assigned_to'    => 'required|exists:users,id',
            'status'         => 'nullable|in:assigned',
            'scheduled_date' => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $validated['assigned_by'] = $request->user()->id;
        $validated['assigned_to'] = $validated['assigned_to'] ?? $request->user()->id;
        $validated['status'] = $validated['status'] ?? 'assigned';

        $complaint = \App\Domain\Maintenance\Models\Complaint::findOrFail($validated['complaint_id']);
        $job = app(\App\Domain\Maintenance\Services\MaintenanceService::class)->assignComplaint($complaint, $validated, $request->user()->id);
        if (isset($validated['scheduled_date'])) $job->update(['scheduled_date' => $validated['scheduled_date']]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Job created.',
            'data'    => ['job' => $job->load(['team:id,name', 'complaint:id,title'])],
        ], 201);
    }

    public function show(Job $job)
    {
        $job->load(['team', 'complaint.unit', 'assignedTo:id,name']);
        return response()->json(['status' => 'success', 'data' => ['job' => $job]]);
    }

    public function update(Request $request, Job $job, MaintenanceStatusService $statusService)
    {
        $validated = $request->validate([
            'team_id'        => 'nullable|exists:teams,id',
            'assigned_to'    => 'sometimes|required|exists:users,id',
            'status'         => 'sometimes|required|in:assigned,in_progress,completed',
            'scheduled_date' => 'nullable|date',
            'completed_at'   => 'prohibited',
            'notes'          => 'nullable|string',
        ]);

        $job = $statusService->updateJob($job, $validated, $request->user()->id);

        return response()->json([
            'status'  => 'success',
            'message' => 'Job updated.',
            'data'    => ['job' => $job->load('complaint:id,title,status,assigned_to')],
        ]);
    }

    public function destroy(Job $job)
    {
        $job->delete();
        return response()->json(['status' => 'success', 'message' => 'Job deleted.']);
    }
}
