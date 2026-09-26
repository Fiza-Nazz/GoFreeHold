import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import DubaiClock from '../gfh/DubaiClock'

/* ── Simple inline SVG icon set (no external deps) ────────────────── */
const Icon = ({ path, size = 18 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

const icons = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
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
  menu: 'M3 12h18M3 6h18M3 18h18',
  user: 'M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  chevron: 'M9 18l6-6-6-6',
}

/** Real Admin routes only — grouped like the reference Modules / Lease / Accounts pattern. */
const adminNavItems = [
  { section: 'MAIN', items: [
    { to: '/admin/dashboard', icon: icons.dashboard, label: 'Dashboard' },
  ]},
  { section: 'Lease & Expense', items: [
    { to: '/admin/call-logs', icon: icons.phone, label: 'Call Logs' },
    { to: '/admin/payments', icon: icons.card, label: 'Payments' },
    { to: '/admin/ledger', icon: icons.ledger, label: 'Rent Ledger' },
    { to: '/admin/receivables', icon: icons.wallet, label: 'Receivables' },
    { to: '/admin/receivables-categorized', icon: icons.folder, label: 'Categorized Dues' },
    { to: '/admin/service-charges', icon: icons.bolt, label: 'Service Charges' },
    { to: '/admin/financial-tracking', icon: icons.trending, label: 'Financial Tracking' },
    { to: '/admin/settlements', icon: icons.handshake, label: 'Settlements' },
  ]},
  { section: 'Accounts', items: [
    { to: '/admin/contract-payables', icon: icons.wallet, label: 'Contract Payables' },
    { to: '/admin/bank-accounts', icon: icons.bank, label: 'Bank Accounts' },
    { to: '/admin/settlement-payments', icon: icons.card, label: 'Settlement Payments' },
    { to: '/admin/tenancy-res', icon: icons.contracts, label: 'Tenancy Res' },
    { to: '/admin/terms', icon: icons.contracts, label: 'Terms' },
  ]},
  { section: 'Operations', items: [
    { to: '/admin/complaints', icon: icons.wrench, label: 'Complaints' },
    { to: '/admin/jobs', icon: icons.toolbox, label: 'Jobs' },
    { to: '/admin/teams', icon: icons.handshake, label: 'Teams' },
    { to: '/admin/maintenances', icon: icons.wrench, label: 'Maintenances' },
    { to: '/admin/daily-maintenance', icon: icons.toolbox, label: 'Daily Maint. Report' },
    { to: '/admin/inventory', icon: icons.box, label: 'Inventory' },
    { to: '/admin/item-store', icon: icons.box, label: 'Item Store' },
    { to: '/admin/purchase-orders', icon: icons.cart, label: 'Purchase Orders' },
    { to: '/admin/legal', icon: icons.scale, label: 'Legal Cases' },
  ]},
  { section: 'Reports', items: [
    { to: '/admin/reports', icon: icons.chart, label: 'Reports' },
    { to: '/admin/reports/vacant', icon: icons.building, label: 'Vacant Report' },
    { to: '/admin/settings', icon: icons.settings, label: 'Settings' },
  ]},
]

const adminMenuGroups = [
  {
    key: 'properties',
    label: 'Properties',
    icon: icons.building,
    paths: ['/admin/properties', '/admin/units', '/admin/appliances'],
    items: [
      { to: '/admin/properties', icon: icons.building, label: 'Properties' },
      { to: '/admin/units', icon: icons.door, label: 'Units' },
      { to: '/admin/appliances', icon: icons.tv, label: 'Appliance' },
    ],
  },
  {
    key: 'contracts',
    label: 'Contracts',
    icon: icons.contracts,
    paths: ['/admin/contracts', '/admin/pdc', '/admin/tenants'],
    items: [
      { to: '/admin/contracts?status=active', icon: icons.contracts, label: 'Current Contracts List' },
      { to: '/admin/pdc', icon: icons.bank, label: 'Cheque Details' },
      { to: '/admin/tenants/add', icon: icons.user, label: 'Add Tenant' },
      { to: '/admin/tenants', icon: icons.user, label: 'Tenant List' },
      { to: '/admin/tenants/previous', icon: icons.user, label: 'Previous Tenants List' },
      { to: '/admin/contracts?action=add', icon: icons.contracts, label: 'Tenancy Contract' },
      { to: '/admin/contracts?status=expired', icon: icons.contracts, label: 'Expired Contracts' },
    ],
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/properties': 'Properties',
  '/admin/properties/add': 'Add Property',
  '/admin/units': 'Units',
  '/admin/tenants': 'Tenant List',
  '/admin/tenants/add': 'Add Tenant',
  '/admin/tenants/previous': 'Previous Tenants',
  '/admin/contracts': 'Contracts',
  '/admin/pdc': 'PDC Cheques',
  '/admin/call-logs': 'Call Logs',
  '/admin/payments': 'Payments',
  '/admin/ledger': 'Rent Ledger',
  '/admin/receivables': 'Receivables',
  '/admin/receivables-categorized': 'Categorized Dues',
  '/admin/service-charges': 'Service Charges',
  '/admin/financial-tracking': 'Financial Tracking',
  '/admin/settlements': 'Settlements',
  '/admin/complaints': 'Complaints',
  '/admin/jobs': 'Jobs',
  '/admin/teams': 'Teams',
  '/admin/maintenances': 'Maintenances',
  '/admin/daily-maintenance': 'Daily Maint. Report',
  '/admin/inventory': 'Inventory',
  '/admin/item-store': 'Item Store',
  '/admin/appliances': 'Appliances',
  '/admin/purchase-orders': 'Purchase Orders',
  '/admin/legal': 'Legal Cases',
  '/admin/tenancy-res': 'Tenancy Res',
  '/admin/terms': 'Terms',
  '/admin/contract-payables': 'Contract Payables',
  '/admin/bank-accounts': 'Bank Accounts',
  '/admin/settlement-payments': 'Settlement Payments',
  '/admin/reports': 'Reports',
  '/admin/reports/vacant': 'Vacant Report',
  '/admin/settings': 'Settings',
}

function resolveTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const match = Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k) && k !== '/admin/dashboard')
  return match ? PAGE_TITLES[match] : 'Admin'
}

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    properties: adminMenuGroups[0].paths.some(path => location.pathname.startsWith(path)),
    contracts: adminMenuGroups[1].paths.some(path => location.pathname.startsWith(path)),
  })
  const pageTitle = resolveTitle(location.pathname)
  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    setOpenGroups(current => {
      const next = { ...current }
      adminMenuGroups.forEach(group => {
        if (group.paths.some(path => location.pathname.startsWith(path))) next[group.key] = true
      })
      return next
    })
  }, [location.pathname])

  const isMenuLinkActive = (target: string) => {
    const [targetPath, targetQuery = ''] = target.split('?')
    if (location.pathname !== targetPath) return false
    const requiredParams = new URLSearchParams(targetQuery)
    if ([...requiredParams].length === 0) return !location.search
    return [...requiredParams].every(([key, value]) => searchParams.get(key) === value)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="gfh-app-layout">
      <style>{`
        .gfh-app-layout {
          display: flex;
          min-height: 100vh;
          background: #F6F8FA;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
          color: #0F172A;
        }

        .gfh-sidebar {
          width: 256px;
          min-width: 256px;
          background: #072E24;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          border-right: 1px solid rgba(255, 255, 255, 0.07);
        }

        .gfh-sidebar::-webkit-scrollbar { width: 5px; }
        .gfh-sidebar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.16); border-radius: 4px; }

        .gfh-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: #05231B;
        }

        .gfh-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.14);
          border: 1px solid rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #34D399;
          flex-shrink: 0;
        }

        .gfh-logo-text {
          font-size: 18px;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.2;
          letter-spacing: -0.015em;
        }

        .gfh-logo-sub {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.58);
          text-transform: uppercase;
          margin-top: 2px;
        }

        .gfh-sidebar-nav {
          flex: 1;
          padding: 14px 12px 20px;
        }

        .gfh-nav-section-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.48);
          padding: 20px 14px 8px;
        }

        .gfh-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          margin: 2px 0;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.78);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.45;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .gfh-nav-item:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #FFFFFF;
        }

        .gfh-nav-item.active {
          background: #0D5C46;
          color: #FFFFFF;
          font-weight: 600;
          border-radius: 8px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .gfh-nav-item.active .gfh-nav-icon {
          color: #FFFFFF;
        }

        .gfh-nav-group-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          margin: 2px 0;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: rgba(255, 255, 255, 0.82);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.45;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .gfh-nav-group-toggle:hover,
        .gfh-nav-group-toggle.current {
          background: rgba(255, 255, 255, 0.07);
          color: #FFFFFF;
          font-weight: 600;
        }

        .gfh-nav-group-chevron {
          margin-left: auto;
          display: flex;
          opacity: 0.7;
          transition: transform 0.18s ease;
        }

        .gfh-nav-group-chevron.open { transform: rotate(90deg); }

        .gfh-nav-submenu {
          margin: 4px 0 8px 18px;
          padding-left: 10px;
          border-left: 1px solid rgba(255, 255, 255, 0.14);
        }

        .gfh-nav-submenu .gfh-nav-item {
          padding: 8px 12px;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.72);
        }

        .gfh-nav-submenu .gfh-nav-item.active {
          color: #FFFFFF;
          font-weight: 600;
          background: #0D5C46;
        }

        .gfh-nav-submenu .gfh-nav-item svg {
          width: 15px;
          height: 15px;
        }

        .gfh-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: inherit;
        }

        .gfh-sidebar-footer {
          padding: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: #05231B;
        }

        .gfh-user-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 8px;
          border-radius: 8px;
        }

        .gfh-user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #0D5C46;
          border: 1px solid rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #FFFFFF;
          flex-shrink: 0;
        }

        .gfh-user-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #FFFFFF;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gfh-user-role {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.58);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .gfh-logout-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.65);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .gfh-logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #FCA5A5;
        }

        .gfh-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #F6F8FA;
        }

        .gfh-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 32px;
          background: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .gfh-page-title {
          font-size: 24px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.015em;
        }

        .gfh-mobile-menu-btn {
          background: none;
          border: none;
          color: #0F172A;
          cursor: pointer;
          display: none;
          padding: 4px;
        }

        .gfh-welcome-text {
          font-size: 12px;
          color: #64748B;
          font-weight: 500;
        }

        .gfh-welcome-name {
          font-size: 14px;
          font-weight: 600;
          color: #0F172A;
        }

        .gfh-page-content {
          flex: 1;
          padding: 28px 32px;
          background: #F6F8FA;
          animation: gfhFadeIn 0.3s ease;
        }

        @keyframes gfhFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gfh-sidebar-overlay { display: none; }

        @media (max-width: 900px) {
          .gfh-sidebar {
            position: fixed;
            left: -280px;
            top: 0;
            z-index: 100;
            transition: left 0.3s ease;
          }
          .gfh-sidebar.open { left: 0; }
          .gfh-mobile-menu-btn { display: inline-flex; }
          .gfh-sidebar-overlay.open {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.55);
            z-index: 99;
          }
        }
      `}</style>

      <aside className={`gfh-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="gfh-sidebar-logo">
          <div className="gfh-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34D3A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="7" y="2" width="10" height="20" rx="1" />
              <rect x="2" y="8" width="5" height="14" rx="1" />
              <rect x="17" y="8" width="5" height="14" rx="1" />
              <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
            </svg>
          </div>
          <div>
            <div className="gfh-logo-text">GoFreeHold</div>
            <div className="gfh-logo-sub">ADMIN PORTAL</div>
          </div>
        </div>

        <nav className="gfh-sidebar-nav">
          {adminNavItems.map((section) => (
            <div key={section.section}>
              <div className="gfh-nav-section-label">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `gfh-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="gfh-nav-icon"><Icon path={item.icon} /></span>
                  {item.label}
                </NavLink>
              ))}
              {section.section === 'MAIN' && adminMenuGroups.map(group => {
                const isOpen = openGroups[group.key]
                const isCurrent = group.paths.some(path => location.pathname.startsWith(path))
                return (
                  <div key={group.key}>
                    <button
                      type="button"
                      className={`gfh-nav-group-toggle ${isCurrent ? 'current' : ''}`}
                      aria-expanded={isOpen}
                      aria-controls={`admin-${group.key}-submenu`}
                      onClick={() => setOpenGroups(current => ({ ...current, [group.key]: !current[group.key] }))}
                    >
                      <span className="gfh-nav-icon"><Icon path={group.icon} /></span>
                      <span>{group.label}</span>
                      <span className={`gfh-nav-group-chevron ${isOpen ? 'open' : ''}`}><Icon path={icons.chevron} size={15} /></span>
                    </button>
                    {isOpen && (
                      <div id={`admin-${group.key}-submenu`} className="gfh-nav-submenu">
                        {group.items.map(item => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={() => `gfh-nav-item ${isMenuLinkActive(item.to) ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <span className="gfh-nav-icon"><Icon path={item.icon} /></span>
                            <span>{item.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="gfh-sidebar-footer">
          <div className="gfh-user-row">
            <div className="gfh-user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="gfh-user-name">{user?.name}</div>
              <div className="gfh-user-role">Administrator</div>
            </div>
            <button onClick={handleLogout} title="Logout" className="gfh-logout-btn">
              <Icon path={icons.logout} size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="gfh-main-content">
        <header className="gfh-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#0F8A67',
                color: '#FFFFFF',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(15, 138, 103, 0.25)',
                flexShrink: 0,
              }}
              title="Toggle Sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1 className="gfh-page-title" style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
              {pageTitle}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {/* Topbar Search Bar — on /admin/contracts and /admin/inventory */}
            {(location.pathname === '/admin/contracts' || location.pathname === '/admin/inventory') && (
              <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    const val = e.target.value
                    setSearchParams(val ? { q: val } : {}, { replace: true })
                  }}
                  placeholder={location.pathname === '/admin/inventory' ? 'Search inventory...' : 'Search contracts...'}
                  style={{
                    width: '100%',
                    padding: '7px 34px 7px 34px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    fontSize: 13,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                />
                <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            )}

            {/* User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#0F8A67', color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13,
              }}>
                {user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'AU'}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1 }}>Welcome back,</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {user?.name || 'Admin User'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="gfh-page-content">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="gfh-sidebar-overlay open"
        />
      )}
    </div>
  )
}
