<?php
namespace App\Domain\Maintenance\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domain\Maintenance\Models\Job;
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
            'assigned_to'    => 'nullable|exists:users,id',
            'status'         => 'nullable|string|max:50',
            'scheduled_date' => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $validated['assigned_by'] = $request->user()->id;
        $validated['assigned_to'] = $validated['assigned_to'] ?? $request->user()->id;
        $validated['status'] = $validated['status'] ?? 'assigned';

        $job = Job::create($validated);

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

    public function update(Request $request, Job $job)
    {
        $validated = $request->validate([
            'team_id'        => 'nullable|exists:teams,id',
            'assigned_to'    => 'nullable|exists:users,id',
            'status'         => 'nullable|string|max:50',
            'scheduled_date' => 'nullable|date',
            'completed_at'   => 'nullable|date',
            'notes'          => 'nullable|string',
        ]);

        $job->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Job updated.',
            'data'    => ['job' => $job],
        ]);
    }

    public function destroy(Job $job)
    {
        $job->delete();
        return response()->json(['status' => 'success', 'message' => 'Job deleted.']);
    }
}
