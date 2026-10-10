import api from './axios'
import type {
  AuditLog,
  ImpersonationSession,
  Organization,
  OrganizationStatus,
  PlatformDashboardStats,
  PlatformSettings,
  PlatformSubscription,
  PlatformUser,
  SubscriptionPlan,
} from '../types/platform'

type ListEnvelope<K extends string, T> = {
  data?: Partial<Record<K, T[]>> & { data?: T[] }
} & Partial<Record<K, T[]>>

function unwrapList<T>(payload: any, keys: string[]): T[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data) && !payload.data[keys[0]]) return payload.data
  for (const key of keys) {
    if (Array.isArray(payload?.data?.[key])) return payload.data[key]
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

function unwrapItem<T>(payload: any, keys: string[]): T | null {
  for (const key of keys) {
    if (payload?.data?.[key]) return payload.data[key]
    if (payload?.[key]) return payload[key]
  }
  return (payload?.data && !Array.isArray(payload.data) ? payload.data : null) as T | null
}

export async function fetchPlatformDashboard(): Promise<PlatformDashboardStats> {
  const res = await api.get('/admin/dashboard')
  const data = res.data?.data || res.data || {}
  const n = (key: string, ...aliases: string[]) => {
    for (const k of [key, ...aliases]) {
      if (data[k] != null && data[k] !== '') return Number(data[k]) || 0
    }
    return 0
  }
  return {
    active_organizations: n('active_organizations'),
    trial_organizations: n('trial_organizations'),
    suspended_organizations: n('suspended_organizations'),
    total_organizations: n('total_organizations', 'organizations_count'),
    active_users: n('active_users', 'total_users'),
    total_owners: n('total_owners', 'owners_count'),
    total_staff: n('total_staff', 'staff_count'),
    total_tenants: n('total_tenants', 'tenants_count'),
    total_properties: n('total_properties', 'properties_count'),
    total_units: n('total_units', 'units_count'),
    occupied_units: n('occupied_units'),
    vacant_units: n('vacant_units'),
    total_contracts: n('total_contracts', 'contracts_count'),
    active_contracts: n('active_contracts'),
    subscription_mrr: n('subscription_mrr', 'mrr'),
    recent_audit: unwrapList<AuditLog>(data, ['recent_audit', 'audit_logs']),
  }
}

export async function fetchOrganizations(params?: Record<string, string | number | undefined>) {
  const res = await api.get('/admin/organizations', { params })
  return unwrapList<Organization>(res.data, ['organizations'])
}

export async function fetchOrganization(id: number) {
  const res = await api.get(`/admin/organizations/${id}`)
  return unwrapItem<Organization>(res.data, ['organization'])
}

export async function createOrganization(body: {
  name: string
  owner_name: string
  owner_email: string
  plan_id?: number | null
  status?: OrganizationStatus
  notes?: string
}) {
  const res = await api.post('/admin/organizations', body)
  return unwrapItem<Organization>(res.data, ['organization'])
}

export async function updateOrganization(id: number, body: Partial<Organization>) {
  const res = await api.put(`/admin/organizations/${id}`, body)
  return unwrapItem<Organization>(res.data, ['organization'])
}

export async function suspendOrganization(id: number, reason?: string) {
  const res = await api.post(`/admin/organizations/${id}/suspend`, { reason })
  return unwrapItem<Organization>(res.data, ['organization'])
}

export async function reactivateOrganization(id: number) {
  const res = await api.post(`/admin/organizations/${id}/reactivate`)
  return unwrapItem<Organization>(res.data, ['organization'])
}

export async function fetchPlatformUsers(params?: Record<string, string | number | undefined>) {
  const res = await api.get('/admin/users', { params })
  return unwrapList<PlatformUser>(res.data, ['users'])
}

export async function createPlatformUser(body: {
  name: string
  email: string
  role: 'admin' | 'owner'
  organization_id?: number | null
  password?: string
  account_status?: 'pending' | 'active' | 'disabled'
}) {
  const res = await api.post('/admin/users', body)
  return unwrapItem<PlatformUser>(res.data, ['user'])
}

export async function updatePlatformUser(id: number, body: Partial<PlatformUser>) {
  const res = await api.put(`/admin/users/${id}`, body)
  return unwrapItem<PlatformUser>(res.data, ['user'])
}

export async function disablePlatformUser(id: number) {
  const res = await api.post(`/admin/users/${id}/disable`)
  return unwrapItem<PlatformUser>(res.data, ['user'])
}

export async function enablePlatformUser(id: number) {
  const res = await api.post(`/admin/users/${id}/enable`)
  return unwrapItem<PlatformUser>(res.data, ['user'])
}

export async function fetchPlans() {
  const res = await api.get('/admin/plans')
  return unwrapList<SubscriptionPlan>(res.data, ['plans'])
}

export async function createPlan(body: Partial<SubscriptionPlan>) {
  const res = await api.post('/admin/plans', body)
  return unwrapItem<SubscriptionPlan>(res.data, ['plan'])
}

export async function updatePlan(id: number, body: Partial<SubscriptionPlan>) {
  const res = await api.put(`/admin/plans/${id}`, body)
  return unwrapItem<SubscriptionPlan>(res.data, ['plan'])
}

export async function fetchSubscriptions(params?: Record<string, string | number | undefined>) {
  const res = await api.get('/admin/subscriptions', { params })
  return unwrapList<PlatformSubscription>(res.data, ['subscriptions'])
}

export async function updateSubscription(id: number, body: Partial<PlatformSubscription>) {
  const res = await api.put(`/admin/subscriptions/${id}`, body)
  return unwrapItem<PlatformSubscription>(res.data, ['subscription'])
}

export async function fetchAuditLogs(params?: Record<string, string | number | undefined>) {
  const res = await api.get('/admin/audit-logs', { params })
  return unwrapList<AuditLog>(res.data, ['audit_logs'])
}

export async function fetchPlatformSettings() {
  const res = await api.get('/admin/settings')
  return (unwrapItem<PlatformSettings>(res.data, ['settings']) || {}) as PlatformSettings
}

export async function updatePlatformSettings(body: PlatformSettings) {
  const res = await api.put('/admin/settings', body)
  return (unwrapItem<PlatformSettings>(res.data, ['settings']) || body) as PlatformSettings
}

export async function startImpersonation(userId: number) {
  const res = await api.post('/admin/impersonations', { user_id: userId })
  return {
    token: res.data?.data?.token || res.data?.token,
    user: res.data?.data?.user || res.data?.user,
    impersonation: (res.data?.data?.impersonation || res.data?.impersonation) as ImpersonationSession | undefined,
  }
}

export async function exitImpersonation() {
  const res = await api.post('/admin/impersonations/exit')
  return {
    token: res.data?.data?.token || res.data?.token,
    user: res.data?.data?.user || res.data?.user,
  }
}
