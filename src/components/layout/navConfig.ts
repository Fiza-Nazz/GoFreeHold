import type { UserRole } from '../../types'

export interface NavLinkItem {
  to: string
  label: string
  icon?: string
  end?: boolean
}

export interface MenuGroup {
  key: string
  label: string
  icon: string
  paths: string[]
  items: NavLinkItem[]
}

export interface NavSection {
  section: string
  items: NavLinkItem[]
  /** Render accordion groups immediately after this section's links */
  insertGroups?: boolean
}

export interface PortalNavConfig {
  logoSub: string
  roleLabel: string
  logoIcon: string
  defaultTitle: string
  pageTitles: Record<string, string>
  /** Owner-style highlighted dashboard link at top of nav */
  dashboard?: NavLinkItem
  sections?: NavSection[]
  groups?: MenuGroup[]
  searchPaths?: string[]
}

export const icons = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  dashboardAlt: 'M3 3h8v8H3V3zm10 0h8v5h-8V3zm0 9h8v9h-8v-9zM3 13h8v8H3v-8z',
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1',
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  contracts: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  bank: 'M3 21h18M4 10h16M12 3 3 8h18L12 3zM6 10v8M10 10v8M14 10v8M18 10v8',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  card: 'M2 5h20v14H2V5zm0 5h20M6 15h4',
  ledger: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  wallet: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',
  bolt: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z',
  trending: 'M22 7 13.5 15.5l-5-5L2 18M16 7h6v6',
  handshake: 'M11 12H3v-2l4-4 4 4M22 12h-8l-2-2M8 15l3 3 6-6M15 9l2-2 4 4-2 2',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  toolbox: 'M2 12h20M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4M2 12v7a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-7M10 12v2M14 12v2',
  box: 'M21 8v13H3V8M1 3h22v5H1V3zM10 12h4',
  tv: 'M4 6h16v11H4V6zM9 20h6M12 17v3',
  cart: 'M6 6h15l-1.5 9h-12L6 6zM6 6 5 3H2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  scale: 'M12 3v18M6 7h12M6 7 3 13a3 3 0 0 0 6 0L6 7zM18 7l-3 6a3 3 0 0 0 6 0l-3-6M9 21h6',
  chart: 'M3 3v18h18M8 17V9m4 8V5m4 12v-6',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.35a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.65 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.65 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.65a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15 4.65a1.7 1.7 0 0 0 1.87.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.35 9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.96z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  chevronDown: 'M6 9l6 6 6-6',
  note: 'M4 4h13l3 3v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 9h8M8 13h8M8 17h5',
  plus: 'M12 4v16m8-8H4',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  receipt: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  invoice: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
}

function adminConfig(): PortalNavConfig {
  return {
    logoSub: 'PLATFORM ADMIN',
    roleLabel: 'Platform Administrator',
    logoIcon: icons.settings,
    defaultTitle: 'Platform Admin',
    searchPaths: ['/admin/organizations', '/admin/users'],
    pageTitles: {
      '/admin/dashboard': 'Platform Dashboard',
      '/admin/organizations': 'Organizations',
      '/admin/users': 'Platform Users',
      '/admin/plans': 'Plans & Subscriptions',
      '/admin/audit-logs': 'Audit Logs',
      '/admin/settings': 'Platform Settings',
    },
    sections: [
      {
        section: 'PLATFORM',
        items: [
          { to: '/admin/dashboard', icon: icons.dashboard, label: 'Dashboard' },
          { to: '/admin/organizations', icon: icons.building, label: 'Organizations' },
          { to: '/admin/users', icon: icons.user, label: 'Users' },
          { to: '/admin/plans', icon: icons.card, label: 'Plans & Billing' },
          { to: '/admin/audit-logs', icon: icons.note, label: 'Audit Logs' },
          { to: '/admin/settings', icon: icons.settings, label: 'Settings' },
        ],
      },
    ],
  }
}

function ownerConfig(): PortalNavConfig {
  return {
    logoSub: 'Owner Portal',
    roleLabel: 'Property Owner',
    logoIcon: icons.building,
    defaultTitle: 'Owner Portal',
    searchPaths: ['/owner/contracts', '/owner/inventory'],
    dashboard: { to: '/owner/dashboard', label: 'Dashboard', icon: icons.dashboard },
    pageTitles: {
      '/owner/dashboard': 'Dashboard',
      '/owner/properties': 'Properties',
      '/owner/properties/add': 'Add Property',
      '/owner/portfolio': 'Total Properties',
      '/owner/units': 'Units',
      '/owner/vacant-units': 'Vacant Properties',
      '/owner/tenants': 'Tenant List',
      '/owner/tenants/previous': 'Contract History',
      '/owner/contracts': 'Contracts',
      '/owner/prepared-contracts': 'Prepare Tenancy Contract',
      '/pdc': 'PDC Cheques',
      '/owner/call-logs': 'Call Logs',
      '/owner/payments': 'Payments',
      '/owner/ledger': 'Rent Ledger',
      '/owner/receivables': 'Receivables',
      '/owner/receivables-categorized': 'Categorized Dues',
      '/owner/service-charges': 'Service Charges',
      '/owner/financial-tracking': 'Financial Tracking',
      '/owner/settlements': 'Settlements',
      '/owner/complaints': 'Maintenance & Complaints',
      '/owner/jobs': 'Jobs',
      '/owner/teams': 'Teams',
      '/owner/maintenances': 'Maintenances',
      '/owner/daily-maintenance': 'Daily Maint. Report',
      '/owner/inventory': 'Inventory',
      '/owner/item-store': 'Item Store',
      '/owner/appliances': 'Appliances',
      '/owner/purchase-orders': 'Purchase Orders',
      '/owner/legal': 'Legal Cases',
      '/owner/contract-payables': 'Contract Payables',
      '/owner/bank-accounts': 'Bank Accounts',
      '/owner/settlement-payments': 'Settlement Payments',
      '/owner/reports': 'Reports',
      '/owner/reports/vacant': 'Vacant Report',
      '/owner/settings': 'Settings',
      '/owner/staff': 'Manage Staff',
      '/owner/profile': 'Profile',
    },
    groups: [
      {
        key: 'properties',
        label: 'Properties',
        icon: icons.building,
        paths: ['/owner/properties', '/owner/units', '/owner/appliances', '/owner/vacant-units'],
        items: [
          { to: '/owner/properties', label: 'Properties' },
          { to: '/owner/units', label: 'Units' },
          { to: '/owner/appliances', label: 'Appliance' },
        ],
      },
      {
        key: 'contracts',
        label: 'Contracts',
        icon: icons.contracts,
        paths: ['/owner/contracts', '/owner/prepared-contracts', '/pdc', '/owner/tenants'],
        items: [
          { to: '/owner/contracts?status=active', label: 'Current Contracts' },
          { to: '/pdc', label: 'Cheque Details' },
          { to: '/owner/tenants', label: 'Tenant List' },
          { to: '/owner/tenants/previous', label: 'Contract History' },
          { to: '/owner/prepared-contracts', label: 'Prepare Tenancy Contract' },
        ],
      },
      {
        key: 'inventory',
        label: 'Inventory Maintenance',
        icon: icons.box,
        paths: ['/owner/item-store', '/owner/purchase-orders', '/owner/inventory'],
        items: [
          { to: '/owner/item-store', label: 'Item Store' },
          { to: '/owner/purchase-orders', label: 'Purchase Orders' },
        ],
      },
      {
        key: 'accounts',
        label: 'Accounts',
        icon: icons.card,
        paths: [
          '/owner/contract-payables',
          '/owner/bank-accounts',
          '/owner/settlement-payments',
          '/owner/payments',
          '/owner/ledger',
          '/owner/receivables',
          '/owner/service-charges',
        ],
        items: [
          { to: '/owner/contract-payables', label: 'Contract Payables' },
          { to: '/owner/bank-accounts', label: 'Bank Accounts' },
          { to: '/owner/settlement-payments', label: 'Settlement Payments' },
        ],
      },
      {
        key: 'legal',
        label: 'Legal',
        icon: icons.scale,
        paths: ['/owner/legal'],
        items: [{ to: '/owner/legal', label: 'Legal Cases' }],
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: icons.settings,
        paths: ['/owner/staff', '/owner/profile', '/owner/settings'],
        items: [
          { to: '/owner/staff', label: 'Manage Staff' },
          { to: '/owner/profile', label: 'Profile' },
        ],
      },
    ],
  }
}

function tenantConfig(): PortalNavConfig {
  return {
    logoSub: 'Tenant Portal',
    roleLabel: 'Tenant',
    logoIcon: icons.user,
    defaultTitle: 'Tenant',
    pageTitles: {
      '/tenant/dashboard': 'Dashboard',
      '/tenant/dues': 'Rent & DEWA Dues',
      '/tenant/payments': 'Payment History',
      '/tenant/complaints': 'My Complaints',
      '/tenant/profile': 'My Profile',
    },
    sections: [
      {
        section: 'My Dashboard',
        items: [{ to: '/tenant/dashboard', icon: icons.dashboardAlt, label: 'Dashboard' }],
      },
      {
        section: 'Dues & Payments',
        items: [
          { to: '/tenant/dues', icon: icons.wallet, label: 'Rent & DEWA Dues' },
          { to: '/tenant/payments', icon: icons.receipt, label: 'Payment History' },
        ],
      },
      {
        section: 'Support',
        items: [{ to: '/tenant/complaints', icon: icons.wrench, label: 'My Complaints' }],
      },
      {
        section: 'Account',
        items: [{ to: '/tenant/profile', icon: icons.user, label: 'My Profile' }],
      },
    ],
  }
}

function maintenanceConfig(): PortalNavConfig {
  return {
    logoSub: 'Maintenance Portal',
    roleLabel: 'Maintenance',
    logoIcon: icons.wrench,
    defaultTitle: 'Maintenance',
    pageTitles: {
      '/maintenance/jobs': 'Assigned Jobs',
      '/maintenance/dashboard': 'Dashboard',
      '/maintenance/complaints': 'Complaints',
      '/maintenance/daily-report': 'Daily Report',
      '/maintenance/profile': 'Profile',
    },
    sections: [
      {
        section: 'Overview',
        items: [{ to: '/maintenance/dashboard', icon: icons.chart, label: 'Dashboard' }],
      },
      {
        section: 'Work',
        items: [
          { to: '/maintenance/jobs', icon: icons.wrench, label: 'Assigned Jobs' },
          { to: '/maintenance/complaints', icon: icons.wrench, label: 'Complaints' },
          { to: '/maintenance/daily-report', icon: icons.note, label: 'Daily Report' },
        ],
      },
      {
        section: 'Account',
        items: [{ to: '/maintenance/profile', icon: icons.user, label: 'Profile' }],
      },
    ],
  }
}

function staffConfig(role: 'cashier' | 'accountant'): PortalNavConfig {
  const base = `/${role}`
  const roleLabel = role.toUpperCase()
  const items: NavLinkItem[] = [
    { to: `${base}/dashboard`, label: 'Dashboard', icon: icons.home, end: true },
    { to: `${base}/portfolio`, label: 'Properties', icon: icons.building, end: true },
    { to: `${base}/units`, label: 'Units', icon: icons.door, end: true },
    { to: `${base}/contracts`, label: 'Contracts', icon: icons.contracts, end: true },
    { to: `${base}/prepared-contracts`, label: 'Prepare Tenancy Contract', icon: icons.plus, end: true },
    { to: '/pdc', label: 'Cheque Details', icon: icons.card, end: true },
    { to: `${base}/payments`, label: 'Payments', icon: icons.wallet, end: true },
    { to: `${base}/payments/new`, label: 'Record Payment', icon: icons.plus, end: true },
    { to: `${base}/receivables`, label: 'Receivables', icon: icons.invoice, end: true },
  ]
  if (role === 'accountant') {
    items.push({ to: `${base}/ledger`, label: 'Rent Ledger', icon: icons.book, end: true })
  }
  items.push({ to: `${base}/profile`, label: 'Profile', icon: icons.user, end: true })

  const pageTitles: Record<string, string> = {
    [`${base}/dashboard`]: 'Dashboard',
    [`${base}/portfolio`]: 'Properties',
    [`${base}/units`]: 'Units',
    [`${base}/properties`]: 'Property Units',
    [`${base}/contracts`]: 'Contracts',
    [`${base}/prepared-contracts`]: 'Prepare Tenancy Contract',
    '/pdc': 'PDC Cheques',
    [`${base}/payments`]: 'Payments',
    [`${base}/payments/new`]: 'Record Payment',
    [`${base}/receivables`]: 'Receivables',
    [`${base}/ledger`]: 'Rent Ledger',
    [`${base}/profile`]: 'Profile',
  }

  return {
    logoSub: `${roleLabel} Portal`,
    roleLabel,
    logoIcon: icons.building,
    defaultTitle: `${role.charAt(0).toUpperCase()}${role.slice(1)} Portal`,
    pageTitles,
    sections: [{ section: '', items }],
  }
}

export function getPortalNavConfig(role: UserRole): PortalNavConfig {
  switch (role) {
    case 'admin':
      return adminConfig()
    case 'owner':
      return ownerConfig()
    case 'tenant':
      return tenantConfig()
    case 'maintenance':
      return maintenanceConfig()
    case 'cashier':
    case 'accountant':
      return staffConfig(role)
    default:
      return {
        logoSub: 'Portal',
        roleLabel: 'User',
        logoIcon: icons.building,
        defaultTitle: 'Portal',
        pageTitles: {},
        sections: [],
      }
  }
}

export function resolvePageTitle(pathname: string, config: PortalNavConfig): string {
  if (config.pageTitles[pathname]) return config.pageTitles[pathname]
  if (pathname.startsWith('/tenant/complaints/')) return 'Complaint Detail'
  const dashboardKey = Object.keys(config.pageTitles).find((k) => k.endsWith('/dashboard'))
  const match = Object.keys(config.pageTitles)
    .filter((k) => k !== dashboardKey)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || pathname.startsWith(k + '/'))
  return match ? config.pageTitles[match] : config.defaultTitle
}

