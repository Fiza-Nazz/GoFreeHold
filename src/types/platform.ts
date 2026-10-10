import type { User } from './index'

export type OrganizationStatus = 'trial' | 'active' | 'suspended' | 'cancelled'

export interface Organization {
  id: number
  name: string
  slug?: string
  status: OrganizationStatus
  plan_id?: number | null
  plan?: SubscriptionPlan | null
  owner_user_id?: number | null
  owner?: Pick<User, 'id' | 'name' | 'email'> | null
  users_count?: number
  properties_count?: number
  units_count?: number
  trial_ends_at?: string | null
  subscribed_at?: string | null
  suspended_at?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface SubscriptionPlan {
  id: number
  name: string
  code: string
  price_monthly: number
  max_properties?: number | null
  max_units?: number | null
  max_users?: number | null
  features?: string[] | Record<string, boolean> | null
  is_active: boolean
  created_at?: string
}

export interface PlatformSubscription {
  id: number
  organization_id: number
  plan_id: number
  status: OrganizationStatus
  organization?: Organization
  plan?: SubscriptionPlan
  starts_at?: string | null
  ends_at?: string | null
  created_at?: string
}

export interface PlatformUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'owner' | 'cashier' | 'accountant' | 'maintenance' | 'tenant'
  account_status?: 'pending' | 'active' | 'disabled'
  organization_id?: number | null
  organization?: Pick<Organization, 'id' | 'name' | 'status'> | null
  created_at?: string
}

export interface AuditLog {
  id: number
  actor_id?: number | null
  actor?: Pick<User, 'id' | 'name' | 'email'> | null
  organization_id?: number | null
  organization?: Pick<Organization, 'id' | 'name'> | null
  action: string
  entity_type?: string | null
  entity_id?: number | null
  ip_address?: string | null
  meta?: Record<string, unknown> | null
  created_at: string
}

export interface PlatformSettings {
  support_email?: string
  default_trial_days?: number
  feature_flags?: Record<string, boolean>
  branding_name?: string
  branding_logo_url?: string | null
  email_templates?: Record<string, string>
  [key: string]: unknown
}

export interface ImpersonationSession {
  active: boolean
  actor_id: number
  actor_name: string
  target_user_id: number
  started_at: string
  expires_at?: string | null
}

export interface PlatformDashboardStats {
  active_organizations: number
  trial_organizations: number
  suspended_organizations: number
  total_organizations: number
  active_users: number
  total_owners: number
  total_staff: number
  total_tenants: number
  total_properties: number
  total_units: number
  occupied_units: number
  vacant_units: number
  total_contracts: number
  active_contracts: number
  subscription_mrr: number
  recent_audit?: AuditLog[]
}
