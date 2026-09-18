<?php
namespace App\Domain\Maintenance\Services;

use App\Domain\Auth\Models\User;
use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Maintenance\Models\{Complaint, Job};
use Illuminate\Support\Facades\DB;

class MaintenanceStatusService
{
    public function updateComplaintStatus(Complaint $complaint, string $status, int $userId, ?string $notes = null): Job
    {
        $job = $complaint->job;
        abort_unless($job, 409, 'Assign this complaint to an eligible worker first.');
        $jobStatus = match ($status) { 'resolved' => 'completed', 'in_progress' => 'in_progress', 'assigned' => 'assigned', default => 'open' };
        return $this->updateJob($job, ['status' => $jobStatus, 'notes' => $notes ?? $job->notes], $userId);
    }

    public function updateJob(Job $job, array $payload, int $userId): Job
    {
        return DB::transaction(function () use ($job, $payload, $userId) {
            $actor = User::lockForUpdate()->findOrFail($userId);
            $context = app(OwnerContextResolver::class);
            $context->assertActive($actor);
            $complaint = Complaint::lockForUpdate()->findOrFail($job->complaint_id);
            $job = Job::lockForUpdate()->findOrFail($job->id);
            if ($actor->role === 'maintenance') {
                $context->jobs(Job::query(), $actor)->findOrFail($job->id);
                abort_if(count(array_diff(array_keys($payload), ['status','notes'])) > 0, 403);
                $next = $payload['status'] ?? $job->status;
                $allowed = ['assigned' => ['assigned','in_progress'], 'in_progress' => ['in_progress','completed'], 'completed' => ['completed']];
                abort_unless(in_array($next, $allowed[$job->status] ?? [], true), 409, 'Invalid job transition. Start work before completing.');
            } else {
                abort_unless($actor->role === 'admin', 403);
                if (isset($payload['assigned_to'])) app(JobAccessService::class)->technician($complaint, (int) $payload['assigned_to']);
            }
            abort_if(Job::where('complaint_id', $complaint->id)->count() > 1, 409, 'This complaint has multiple jobs. Admin must review the duplicate records before updating status.');
            if (isset($payload['status'])) {
                abort_unless(in_array($payload['status'], ['assigned','in_progress','completed'], true), 422, 'Invalid job status.');
                $payload['completed_at'] = $payload['status'] === 'completed' ? ($job->completed_at ?? now()) : null;
            }
            $job->update($payload);
            $complaint->update(['status' => match ($job->status) {'completed' => 'resolved', 'in_progress' => 'in_progress', default => 'assigned'}, 'assigned_to' => $job->assigned_to]);
            DB::table('staff_access_audits')->insert(['actor_id' => $actor->id, 'owner_id' => $complaint->unit->property->owner_id, 'action' => 'job.updated', 'target_id' => $job->id, 'details' => json_encode(['status' => $job->status, 'assigned_to' => $job->assigned_to]), 'created_at' => now(), 'updated_at' => now()]);
            return $job->fresh();
        }, 3);
    }
}
