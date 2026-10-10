<?php

namespace App\Domain\Platform\Services;

use App\Domain\Platform\Models\AuditLog;

class AuditService
{
    /**
     * Log a platform or security audit trail entry.
     */
    public static function log(
        string $action,
        ?string $entityType = null,
        ?int $entityId = null,
        ?array $meta = null,
        ?int $organizationId = null,
        ?int $actorId = null
    ): AuditLog {
        $user = request()->user();
        $actor = $actorId ?: ($user?->id);
        $orgId = $organizationId ?: ($user?->organization_id);

        return AuditLog::create([
            'actor_id'        => $actor,
            'organization_id' => $orgId,
            'action'          => $action,
            'entity_type'     => $entityType,
            'entity_id'       => $entityId,
            'ip_address'      => request()->ip(),
            'meta'            => $meta,
            'created_at'      => now(),
        ]);
    }
}
