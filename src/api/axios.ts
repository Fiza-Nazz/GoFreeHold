import axios, { CanceledError } from 'axios'
import type { UserRole } from '../types'

/**
 * Centralized Axios instance for GoFreeHold API.
 * Base URL is configured via VITE_API_BASE_URL in .env
 *
 * API context is role/session driven (not pathname driven) so platform
 * impersonation and multi-tab usage stay correct.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api2.gofreehold.com/public/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  withCredentials: false,
})

export type ApiContext = 'platform' | 'organization' | 'owner' | 'tenant' | 'maintenance' | 'public'

const OWNER_STAFF_ROLES: UserRole[] = ['owner', 'cashier', 'accountant']

function readStoredUser(): { role?: UserRole; organization_id?: number | null; impersonation?: { active?: boolean } | null } | null {
  try {
    const raw = localStorage.getItem('gfh_user') || sessionStorage.getItem('gfh_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Resolve which API prefix family the current session should use. */
export function resolveApiContext(role?: UserRole | null): ApiContext {
  const effectiveRole = role || readStoredUser()?.role
  if (!effectiveRole) return 'public'
  if (effectiveRole === 'admin') return 'platform'
  if (OWNER_STAFF_ROLES.includes(effectiveRole)) return 'owner'
  if (effectiveRole === 'tenant') return 'tenant'
  if (effectiveRole === 'maintenance') return 'maintenance'
  return 'organization'
}

/**
 * Rewrite legacy `/admin/...` operational URLs to the org-scoped `/owner/...`
 * when the active session is an owner/staff user.
 * Platform admin calls to `/admin/organizations`, `/admin/users`, etc. stay intact.
 */
function rewriteLegacyAdminUrl(url: string, context: ApiContext): string {
  if (context !== 'owner') return url

  const platformPrefixes = [
    '/admin/dashboard',
    '/admin/organizations',
    '/admin/users',
    '/admin/plans',
    '/admin/subscriptions',
    '/admin/audit-logs',
    '/admin/settings',
    '/admin/impersonations',
  ]

  const normalized = url.startsWith('/') ? url : `/${url}`
  if (platformPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`) || normalized.startsWith(`${prefix}?`))) {
    return url
  }

  if (normalized.startsWith('/admin/')) {
    return normalized.replace(/^\/admin\//, '/owner/')
  }
  if (url.startsWith('admin/')) {
    return url.replace(/^admin\//, 'owner/')
  }
  return url
}

// ΓöÇΓöÇΓöÇ Request Interceptor ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      config.headers.delete('Content-Type')
    }

    const token =
      localStorage.getItem('gfh_token') || sessionStorage.getItem('gfh_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const storedUser = readStoredUser()
    const context = resolveApiContext(storedUser?.role)
    config.headers['X-GFH-Api-Context'] = context

    if (storedUser?.organization_id) {
      config.headers['X-Organization-Id'] = String(storedUser.organization_id)
    }

    if (storedUser?.impersonation?.active) {
      config.headers['X-GFH-Impersonating'] = '1'
    }

    if (config.url) {
      config.url = rewriteLegacyAdminUrl(config.url, context)
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ΓöÇΓöÇΓöÇ Response Interceptor ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
apiClient.interceptors.response.use(
  (response) => {
    const sent = response.config.headers.Authorization
    const current = localStorage.getItem('gfh_token') || sessionStorage.getItem('gfh_token')
    if (sent && sent !== `Bearer ${current}`) throw new CanceledError('Session changed')
    return response
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.data?.code === 'ACCOUNT_ACCESS_DENIED') {
      localStorage.removeItem('gfh-auth')
      sessionStorage.removeItem('gfh-auth')
      localStorage.removeItem('gfh_token')
      sessionStorage.removeItem('gfh_token')
      localStorage.removeItem('gfh_user')
      sessionStorage.removeItem('gfh_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
