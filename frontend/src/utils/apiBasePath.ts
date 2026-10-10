import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types'

/**
 * Operational (property-management) pages always use organization-scoped
 * `/owner` APIs. Platform admin no longer operates on properties via `/admin`.
 */
export function getOrgApiBasePath(_role?: UserRole | null): '/owner' {
  return '/owner'
}

/** Convenience hook for React components. */
export function useOrgApiBasePath(): '/owner' {
  useAuthStore((s) => s.user?.role)
  return getOrgApiBasePath()
}
