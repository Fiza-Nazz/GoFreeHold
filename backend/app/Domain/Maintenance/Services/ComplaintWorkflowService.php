<?php

namespace App\Domain\Maintenance\Services;

use App\Domain\Auth\Models\Owner;
use App\Domain\Auth\Models\OwnerStaff;
use App\Domain\Auth\Models\Tenant;
use App\Domain\Auth\Models\User;
use App\Domain\Auth\Services\OwnerContextResolver;
use App\Domain\Contract\Models\Contract;
use App\Domain\Maintenance\Models\Complaint;
use App\Domain\Maintenance\Models\ComplaintAttachment;
use App\Domain\Maintenance\Models\ComplaintUpdate;
use App\Domain\Maintenance\Models\Job;
use App\Domain\Maintenance\Notifications\ComplaintAssigned;
use App\Domain\Maintenance\Notifications\ComplaintCreated;
use App\Domain\Maintenance\Notifications\ComplaintResolved;
use App\Domain\Property\Models\Unit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ComplaintWorkflowService
{
    public function __construct(
        private readonly OwnerContextResolver $contextResolver,
        private readonly JobAccessService $jobAccess
    ) {
    }

    /**
     * Create a new complaint (tenant or staff).
     *
     * @param  array  $data
     * @param  User  $actor
     * @param  array  $photos
     * @return Complaint
     *
     * @throws ValidationException
     */
    public function create(array $data, User $actor, array $photos = []): Complaint
    {
        return DB::transaction(function () use ($data, $actor, $photos) {
            $unitId = (int) $data['unit_id'];
            $unit = Unit::with('property')->findOrFail($unitId);

            $tenantId = null;
            $source = 'tenant';

            if ($actor->role === 'tenant') {
                $tenant = Tenant::where('user_id', $actor->id)->first();
                abort_unless($tenant, 403, 'A tenant profile and active contract are required to submit a complaint.');

                // Tenant may only use units from active or renewed contracts linked to their tenants row
                $hasActiveContract = Contract::query()
                    ->where('tenant_id', $tenant->id)
                    ->where('unit_id', $unitId)
                    ->whereIn('status', ['active', 'renewed'])
                    ->exists();

                if (!$hasActiveContract) {
                    throw ValidationException::withMessages([
                        'unit_id' => ['The selected unit is not leased under an active contract.'],
                    ]);
                }

                $tenantId = $tenant->id;
                $source = 'tenant';
            } else {
                // Owner / cashier / accountant / maintenance staff
                $source = 'staff';
                $ownerId = $this->resolveOwnerId($actor);

                // Scope to organization via unit -> property -> org / owner
                $propertyOwnerId = (int) ($unit->property?->owner_id ?? $unit->owner_id);
                if ($ownerId && $propertyOwnerId !== $ownerId && $actor->role !== 'admin') {
                    throw ValidationException::withMessages([
                        'unit_id' => ['The selected unit does not belong to your organization.'],
                    ]);
                }

                // If tenant_id not explicitly given, resolve from active contract on unit
                $tenantId = $data['tenant_id'] ?? null;
                if (!$tenantId) {
                    $tenantId = Contract::query()
                        ->where('unit_id', $unitId)
                        ->whereIn('status', ['active', 'renewed'])
                        ->value('tenant_id');
                }
            }

            // Persist category & required fields
            $complaint = Complaint::create([
                'unit_id'     => $unitId,
                'tenant_id'   => $tenantId,
                'title'       => $data['title'],
                'description' => $data['description'],
                'category'    => $data['category'] ?? null,
                'priority'    => $data['priority'] ?? 'medium',
                'status'      => 'open',
                'created_by'  => $actor->id,
                'source'      => $source,
            ]);

            // Store photos if provided (max 3)
            if (!empty($photos)) {
                $this->storeAttachments($complaint, $photos, $actor);
            }

            // Log initial timeline update
            $this->logUpdate($complaint, null, 'open', 'Complaint logged.', $actor->id);

            // Audit record
            $ownerId = (int) ($unit->property?->owner_id ?? $unit->owner_id);
            if ($ownerId) {
                DB::table('staff_access_audits')->insert([
                    'actor_id'   => $actor->id,
                    'owner_id'   => $ownerId,
                    'action'     => 'complaint.created',
                    'target_id'  => $complaint->id,
                    'details'    => json_encode(['source' => $source, 'category' => $complaint->category]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Send notification
            $this->notifyCreated($complaint, $ownerId);

            return $complaint->fresh(['unit.property', 'tenant:id,name,email', 'attachments', 'updates']);
        });
    }

    /**
     * Assign complaint to technician and schedule.
     *
     * @param  Complaint  $complaint
     * @param  array  $data
     * @param  User  $actor
     * @return Job
     *
     * @throws ValidationException
     */
    public function assign(Complaint $complaint, array $data, User $actor): Job
    {
        return DB::transaction(function () use ($complaint, $data, $actor) {
            $complaint = Complaint::lockForUpdate()->with('unit.property', 'tenant.user')->findOrFail($complaint->id);

            // Cannot assign resolved complaint
            if ($complaint->status === 'resolved') {
                throw ValidationException::withMessages([
                    'status' => ['Cannot assign a resolved complaint.'],
                ]);
            }

            $ownerId = (int) ($complaint->unit?->property?->owner_id ?? $complaint->unit?->owner_id);
            $assignedToId = (int) $data['assigned_to'];

            // Validate technician belongs to same organization and has role maintenance
            $technician = User::where('id', $assignedToId)
                ->where('role', 'maintenance')
                ->where('account_status', 'active')
                ->first();

            if (!$technician) {
                throw ValidationException::withMessages([
                    'assigned_to' => ['The selected user is not an active maintenance technician.'],
                ]);
            }

            // Verify org membership
            if ($ownerId) {
                $isSameOrg = OwnerStaff::where('user_id', $technician->id)
                    ->where('owner_id', $ownerId)
                    ->exists();

                if (!$isSameOrg && $technician->id !== $actor->id && $actor->role !== 'admin') {
                    throw ValidationException::withMessages([
                        'assigned_to' => ['The selected technician does not belong to this organization.'],
                    ]);
                }
            }

            // Upsert jobs row (logical 1:1)
            $job = Job::updateOrCreate(
                ['complaint_id' => $complaint->id],
                [
                    'assigned_to'    => $technician->id,
                    'assigned_by'    => $actor->id,
                    'team_id'        => $data['team_id'] ?? null,
                    'status'         => 'assigned',
                    'scheduled_date' => $data['scheduled_date'] ?? null,
                    'notes'          => $data['notes'] ?? null,
                    'completed_at'   => null,
                ]
            );

            $fromStatus = $complaint->status;
            $complaint->update([
                'status'      => 'assigned',
                'assigned_to' => $technician->id,
            ]);

            // Append complaint_updates row
            $this->logUpdate(
                $complaint,
                $fromStatus,
                'assigned',
                $data['notes'] ?? 'Assigned to technician.',
                $actor->id
            );

            // Staff audit
            if ($ownerId) {
                DB::table('staff_access_audits')->insert([
                    'actor_id'   => $actor->id,
                    'owner_id'   => $ownerId,
                    'action'     => 'job.assigned',
                    'target_id'  => $job->id,
                    'details'    => json_encode(['assigned_to' => $technician->id, 'scheduled_date' => $data['scheduled_date'] ?? null]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Notify assignee + tenant (ComplaintAssigned)
            $this->notifyAssigned($complaint, $job, $technician);

            return $job->fresh(['assignedTo:id,name,email', 'assignedBy:id,name']);
        });
    }

    /**
     * Transition complaint status with state machine enforcement.
     *
     * Allowed:
     * - open -> assigned, in_progress
     * - assigned -> in_progress, resolved
     * - in_progress -> resolved
     * - resolved -> (terminal in v1)
     *
     * @param  Complaint  $complaint
     * @param  string  $toStatus
     * @param  string|null  $note
     * @param  User  $actor
     * @return Complaint
     *
     * @throws ValidationException
     */
    public function transition(Complaint $complaint, string $toStatus, ?string $note, User $actor): Complaint
    {
        return DB::transaction(function () use ($complaint, $toStatus, $note, $actor) {
            $complaint = Complaint::lockForUpdate()->with('unit.property', 'tenant.user', 'job')->findOrFail($complaint->id);
            $fromStatus = $complaint->status;

            // Strict transition state machine
            $allowedTransitions = [
                'open'        => ['assigned', 'in_progress'],
                'assigned'    => ['in_progress', 'resolved'],
                'in_progress' => ['resolved'],
                'resolved'    => [],
            ];

            // If same status, allow updating note without status change
            if ($fromStatus !== $toStatus) {
                $validNext = $allowedTransitions[$fromStatus] ?? [];
                if (!in_array($toStatus, $validNext, true)) {
                    throw ValidationException::withMessages([
                        'status' => ["Cannot move from {$fromStatus} to {$toStatus}."],
                    ]);
                }
            }

            // Sync Job status
            $job = $this->syncJobStatus($complaint, $toStatus, $note, $actor);

            // Update complaint
            $updateData = ['status' => $toStatus];
            if ($toStatus === 'resolved') {
                $updateData['resolved_at'] = now();
            }
            $complaint->update($updateData);

            // Log update history
            $this->logUpdate($complaint, $fromStatus, $toStatus, $note, $actor->id);

            // Staff audit
            $ownerId = (int) ($complaint->unit?->property?->owner_id ?? $complaint->unit?->owner_id);
            if ($ownerId) {
                DB::table('staff_access_audits')->insert([
                    'actor_id'   => $actor->id,
                    'owner_id'   => $ownerId,
                    'action'     => 'complaint.status_changed',
                    'target_id'  => $complaint->id,
                    'details'    => json_encode(['from' => $fromStatus, 'to' => $toStatus, 'note' => $note]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // If resolved, notify tenant (ComplaintResolved)
            if ($toStatus === 'resolved') {
                $this->notifyResolved($complaint, $note);
            }

            return $complaint->fresh([
                'unit.property',
                'tenant:id,name,email,phone',
                'job.assignedTo:id,name,email',
                'job.assignedBy:id,name',
                'attachments',
                'updates.user:id,name',
            ]);
        });
    }

    /**
     * Upload and add attachments to an existing complaint.
     *
     * @param  Complaint  $complaint
     * @param  array  $photos
     * @param  User  $actor
     * @return array
     *
     * @throws ValidationException
     */
    public function addAttachments(Complaint $complaint, array $photos, User $actor): array
    {
        $existingCount = $complaint->attachments()->count();
        if ($existingCount + count($photos) > 3) {
            throw ValidationException::withMessages([
                'photos' => ["A maximum of 3 photos is allowed per complaint. Current count: {$existingCount}."],
            ]);
        }

        return $this->storeAttachments($complaint, $photos, $actor);
    }

    /**
     * Store photo files to disk and record ComplaintAttachment models.
     */
    private function storeAttachments(Complaint $complaint, array $photos, User $actor): array
    {
        $saved = [];
        foreach ($photos as $photo) {
            if (!$photo || !method_exists($photo, 'isValid') || !$photo->isValid()) {
                continue;
            }

            $uuid = Str::uuid()->toString();
            $ext = $photo->getClientOriginalExtension() ?: 'jpg';
            $filename = "{$uuid}.{$ext}";
            $path = "complaints/{$complaint->id}/{$filename}";

            // Store on public disk
            Storage::disk('public')->putFileAs("complaints/{$complaint->id}", $photo, $filename);

            $attachment = ComplaintAttachment::create([
                'complaint_id' => $complaint->id,
                'file_path'    => $path,
                'file_name'    => $photo->getClientOriginalName(),
                'mime_type'    => $photo->getClientMimeType(),
                'file_size'    => $photo->getSize(),
                'uploaded_by'  => $actor->id,
            ]);

            $saved[] = $attachment;
        }

        return $saved;
    }

    /**
     * Record a timeline history entry in complaint_updates.
     */
    public function logUpdate(Complaint $complaint, ?string $fromStatus, ?string $toStatus, ?string $note, ?int $userId): ComplaintUpdate
    {
        return ComplaintUpdate::create([
            'complaint_id' => $complaint->id,
            'user_id'      => $userId,
            'from_status'  => $fromStatus,
            'to_status'    => $toStatus,
            'note'         => $note,
        ]);
    }

    /**
     * Sync job status based on complaint status.
     */
    private function syncJobStatus(Complaint $complaint, string $complaintStatus, ?string $note, User $actor): ?Job
    {
        $jobStatusMap = [
            'open'        => null,
            'assigned'    => 'assigned',
            'in_progress' => 'in_progress',
            'resolved'    => 'completed',
        ];

        $targetJobStatus = $jobStatusMap[$complaintStatus] ?? null;
        if (!$targetJobStatus) {
            return $complaint->job;
        }

        $job = Job::where('complaint_id', $complaint->id)->first();
        if ($job) {
            $jobUpdates = ['status' => $targetJobStatus];
            if ($note) {
                $jobUpdates['notes'] = $note;
            }
            if ($targetJobStatus === 'completed') {
                $jobUpdates['completed_at'] = now();
            }
            $job->update($jobUpdates);
            return $job->fresh();
        }

        // If job doesn't exist yet but supervisor starts work or resolves directly
        $assigneeId = $complaint->assigned_to ?: $actor->id;
        return Job::create([
            'complaint_id'   => $complaint->id,
            'assigned_to'    => $assigneeId,
            'assigned_by'    => $actor->id,
            'status'         => $targetJobStatus,
            'notes'          => $note,
            'completed_at'   => $targetJobStatus === 'completed' ? now() : null,
            'scheduled_date' => now()->toDateString(),
        ]);
    }

    /**
     * Send ComplaintCreated notification to org owner and maintenance team.
     */
    private function notifyCreated(Complaint $complaint, ?int $ownerId): void
    {
        try {
            $recipients = collect();

            if ($ownerId) {
                // Owner user
                $ownerUser = Owner::find($ownerId)?->user;
                if ($ownerUser) {
                    $recipients->push($ownerUser);
                }

                // Maintenance staff in org
                $staffUsers = User::where('role', 'maintenance')
                    ->where('account_status', 'active')
                    ->whereHas('staffMembership', fn ($q) => $q->where('owner_id', $ownerId))
                    ->get();

                $recipients = $recipients->merge($staffUsers)->unique('id');
            }

            if ($recipients->isNotEmpty()) {
                Notification::send($recipients, new ComplaintCreated($complaint));
            }
        } catch (\Throwable $e) {
            Log::warning('ComplaintCreated notification failed: ' . $e->getMessage());
        }
    }

    /**
     * Send ComplaintAssigned notification to assignee and tenant.
     */
    private function notifyAssigned(Complaint $complaint, Job $job, User $technician): void
    {
        try {
            // Notify technician
            $technician->notify(new ComplaintAssigned($complaint, $job));

            // Notify tenant if linked
            if ($complaint->tenant?->user) {
                $complaint->tenant->user->notify(new ComplaintAssigned($complaint, $job));
            }
        } catch (\Throwable $e) {
            Log::warning('ComplaintAssigned notification failed: ' . $e->getMessage());
        }
    }

    /**
     * Send ComplaintResolved notification to tenant.
     */
    private function notifyResolved(Complaint $complaint, ?string $note): void
    {
        try {
            if ($complaint->tenant?->user) {
                $complaint->tenant->user->notify(new ComplaintResolved($complaint, $note));
            }
        } catch (\Throwable $e) {
            Log::warning('ComplaintResolved notification failed: ' . $e->getMessage());
        }
    }

    /**
     * Helper to resolve owner ID from actor.
     */
    private function resolveOwnerId(User $actor): ?int
    {
        if ($actor->role === 'owner') {
            return Owner::where('user_id', $actor->id)->value('id');
        }

        if (in_array($actor->role, ['cashier', 'accountant', 'maintenance'], true)) {
            return OwnerStaff::where('user_id', $actor->id)->value('owner_id');
        }

        return null;
    }
}
