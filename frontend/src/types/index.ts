// ============================================================
// GoFreeHold — Global TypeScript Types (real schema aligned)
// ============================================================

export type UserRole = 'admin' | 'maintenance' | 'owner' | 'tenant'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  phone?: string
  avatar?: string
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  rememberMe: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface ValidationErrors {
  [field: string]: string[]
}

// ─── Owner / Tenant profiles ──────────────────────────────────────────────────
export interface Owner {
  id: number
  user_id?: number | null
  name: string
  contact?: string
  email?: string
  address?: string
  user?: User
  created_at?: string
}

export interface Tenant {
  id: number
  user_id: number
  name?: string
  email?: string
  address?: string
  contact?: string
  emirates_id?: string
  phone?: string
  nationality?: string
  passport_number?: string
  user?: User
  created_at?: string
}

// ─── Property (was Building) ──────────────────────────────────────────────────
/** @deprecated Use Property — kept as alias for gradual migration */
export type Building = Property

export interface Property {
  id: number
  owner_id: number
  name: string
  address: string
  city: string
  description?: string
  /** FLAG: draft extra — pending client confirmation */
  type?: 'residential' | 'commercial' | 'mixed'
  /** FLAG: draft extra — pending client confirmation */
  total_units?: number
  occupied_units?: number
  owner?: User | Owner
  created_at: string
  updated_at: string
}

// ─── Unit ─────────────────────────────────────────────────────────────────────
export type UnitStatus = 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'SOLD'

export interface Unit {
  id: number
  property_id: number
  owner_id?: number
  number: string
  dhewa_no?: string
  category?: string
  floor?: number
  type?: string
  size?: number
  furnished?: boolean
  status: UnitStatus
  price: number
  property?: Property
  current_tenant?: Tenant
  created_at: string
  updated_at: string
}

// ─── Contract ────────────────────────────────────────────────────────────────
export type ContractStatus = 'active' | 'expired' | 'vacated' | 'settled'

export interface Contract {
  id: number
  unit_id: number
  tenant_id: number
  owner_id: number
  date?: string
  start_date: string
  end_date: string
  due_date?: string
  rent_amount: number
  lease_term?: string
  security_deposit: number
  deposit_type?: string
  dewa_deposit?: number
  due?: number
  on_case?: boolean
  last_renewed_at?: string | null
  status: ContractStatus
  unit?: Unit
  tenant?: Tenant
  owner?: Owner | User
  created_at: string
  updated_at: string
}

// ─── Payment ─────────────────────────────────────────────────────────────────
export type PaymentType = 'rent' | 'dewa' | 'deposit' | 'settlement' | 'service_charge' | 'other'
export type PaymentMode = 'cash' | 'card' | 'cheque' | 'bank_transfer' | 'online'

export interface Payment {
  id: number
  contract_id: number
  tenant_id?: number
  type: PaymentType
  mode: PaymentMode
  amount: number
  date: string
  due_date?: string
  receipt_number?: string
  reference_number?: string
  remarks?: string
  contract?: Contract
  created_at: string
}

// ─── Contract Cheque (was PDC) ────────────────────────────────────────────────
export type ChequeStatus = 'pending' | 'cleared' | 'bounced'

export interface ContractCheque {
  id: number
  contract_id: number
  cheque_number: string
  bank_name: string
  amount: number
  due_date: string
  status: ChequeStatus
  notes?: string
  contract?: Contract
  created_at: string
}

/** @deprecated Use ContractCheque */
export type PdcCheque = ContractCheque

// ─── Call Log ─────────────────────────────────────────────────────────────────
export interface CallLog {
  id: number
  contract_id: number
  logged_by?: number
  date: string
  remark: string
  logged_by_user?: User
  created_at?: string
}

// ─── Settlements (owner-centric) ──────────────────────────────────────────────
export interface Settlement {
  id: number
  owner_id: number
  vacant_date: string
  dues: number
  receivable: number
  status: 'pending' | 'completed'
  on_case?: boolean
  owner?: Owner
  docs?: SettlementDoc[]
  payments?: SettlementPayment[]
  created_at?: string
}

export interface SettlementDoc {
  id: number
  settlement_id: number
  file_name?: string
  file_path?: string
}

export interface SettlementPayment {
  id: number
  settlement_id: number
  payment_method?: string
  amount: number
  payment_date: string
}

// ─── Rent Transactions ────────────────────────────────────────────────────────
export interface RentTransaction {
  id: number
  contract_id: number
  date: string
  description?: string
  debit: number
  credit: number
  deleted_at?: string
  contract?: Contract
}

/** @deprecated Use RentTransaction */
export type RentLedgerEntry = RentTransaction

// ─── Contract case docs / payables ────────────────────────────────────────────
export interface ContractCaseDoc {
  id: number
  contract_id: number
  file_name: string
  file_path: string
  created_at?: string
}

export interface ContractPayable {
  id: number
  contract_id: number
  description?: string
  amount: number
  due_date?: string
  status?: 'pending' | 'paid'
  contract?: Contract
}

// ─── Inventory / items ────────────────────────────────────────────────────────
export interface Item {
  id: number
  name: string
  category?: string
  brand?: string
}

export interface UnitItem {
  id: number
  unit_id: number
  item_id: number
  qty?: number
  serial?: string
  warranty?: string
  remark?: string
  image?: string
  item?: Item
  unit?: Unit
}

export interface ItemStore {
  id: number
  item_id: number
  qty: number
  remark?: string
  item?: Item
}

export interface InventoryItem {
  id: number
  location_type: 'warehouse' | 'unit'
  unit_id?: number
  name: string
  category?: string
  quantity: number
  unit_price?: number
  min_stock_alert?: number
  notes?: string
  unit?: Unit
  created_at: string
}

// ─── Teams / Jobs / Maintenances ──────────────────────────────────────────────
export interface Team {
  id: number
  name: string
  phone?: string
  remark?: string
  jobs_count?: number
}

export interface MaintenanceJob {
  id: number
  complaint_id?: number
  team_id?: number
  assigned_to?: number
  assigned_by?: number
  status?: string
  scheduled_date?: string
  completed_at?: string
  notes?: string
  team?: Team
  complaint?: Complaint
}

export interface MaintenanceRecord {
  id: number
  unit_id?: number
  date: string
  description?: string
  cost?: number
  unit?: Unit
}

// ─── Bank accounts ────────────────────────────────────────────────────────────
export interface Bank {
  id: number
  name: string
}

export interface BankAccount {
  id: number
  bank_id?: number
  account_name: string
  account_number?: string
  iban?: string
  branch?: string
  bank?: Bank
}

// ─── Tenancy paperwork ────────────────────────────────────────────────────────
export interface TenancyRes {
  id: number
  contract_id: number
  owner_name?: string
  lessor_name?: string
  lessor_emirates_id?: string
  lessor_license_no?: string
  lessor_email?: string
  lessor_phone?: string
  tenant_name?: string
  tenant_emirates_id?: string
  tenant_license_no?: string
  tenant_email?: string
  tenant_phone?: string
  plot_no?: string
  property_name?: string
  property_usage?: string
  property_area?: string
  premises_no?: string
  property_type?: string
  location?: string
  annual_rent?: number
  period_from?: string
  period_to?: string
  security_deposit?: number
  mode_of_payment?: string
}

export interface Term {
  id: number
  cid: number
  terms: string
}

// ─── Complaint ────────────────────────────────────────────────────────────────
export type ComplaintStatus = 'open' | 'assigned' | 'in_progress' | 'resolved'

export interface Complaint {
  id: number
  tenant_id: number
  unit_id: number
  title: string
  description: string
  status: ComplaintStatus
  assigned_to?: number
  priority?: 'low' | 'medium' | 'high'
  tenant?: Tenant
  unit?: Unit
  assignee?: User
  created_at: string
  updated_at: string
}

// ─── Service charges (dual FK — client confirmation pending) ──────────────────
export interface ServiceCharge {
  id: number
  contract_id: number
  unit_id: number
  charge_type: string
  amount: number
  due_date?: string
  paid_date?: string
  status: 'pending' | 'paid' | 'waived'
  notes?: string
  unit?: Unit
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export interface DashboardStats {
  total_properties: number
  total_units: number
  occupied_units: number
  vacant_units: number
  total_tenants: number
  monthly_revenue: number
  pending_dues: number
  open_complaints: number
}
