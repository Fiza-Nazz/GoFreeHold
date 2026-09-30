import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const Icon = ({ path, size = 18 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={path} />
  </svg>
)

const icons = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1',
  contracts: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  box: 'M21 8v13H3V8M1 3h22v5H1V3zM10 12h4',
  card: 'M2 5h20v14H2V5zm0 5h20M6 15h4',
  scale: 'M12 3v18M6 7h12M6 7 3 13a3 3 0 0 0 6 0L6 7zM18 7l-3 6a3 3 0 0 0 6 0l-3-6M9 21h6',
  gavel: 'M14 7l3 3m-9 9l7-7m-5-5l5 5m-2-8l3-3a2.121 2.121 0 0 1 3 3l-3 3m-8 8l-3 3a2.121 2.121 0 0 1-3-3l3-3',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.35a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.65 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.65 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.65a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15 4.65a1.7 1.7 0 0 0 1.87.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.35 9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.96z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  chevronDown: 'M6 9l6 6 6-6',
}

interface SubMenuItem {
  to: string
  label: string
}

interface MenuGroup {
  key: string
  label: string
  icon: string
  iconColor: string
  iconBg: string
  paths: string[]
  items: SubMenuItem[]
}

/** Strictly organized Owner navigation groups matching Paul Brit's mockup layout */
const ownerMenuGroups: MenuGroup[] = [
  {
    key: 'properties',
    label: 'Properties',
    icon: icons.building,
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    paths: ['/owner/properties', '/owner/units', '/owner/appliances'],
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
    iconColor: '#0284C7',
    iconBg: '#F0F9FF',
    paths: ['/owner/contracts', '/owner/tenants'],
    items: [
      { to: '/owner/contracts?status=active', label: 'Current Contracts' },
      { to: '/owner/tenants/add', label: 'Add Tenant' },
      { to: '/owner/tenants', label: 'Tenant List' },
      { to: '/owner/tenants/previous', label: 'Previous Tenants' },
      { to: '/owner/contracts?action=add', label: 'Tenancy Contract' },
      { to: '/owner/contracts?status=expired', label: 'Expired Contracts' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory Maintenance',
    icon: icons.box,
    iconColor: '#EA580C',
    iconBg: '#FFF7ED',
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
    iconColor: '#0D9488',
    iconBg: '#F0FDFA',
    paths: ['/owner/contract-payables', '/owner/bank-accounts', '/owner/settlement-payments', '/owner/tenancy-res', '/owner/terms'],
    items: [
      { to: '/owner/contract-payables', label: 'Contract Payables' },
      { to: '/owner/bank-accounts', label: 'Bank Accounts' },
      { to: '/owner/settlement-payments', label: 'Settlement Payments' },
      { to: '/owner/tenancy-res', label: 'Tenancy Res' },
      { to: '/owner/terms', label: 'Terms' },
    ],
  },
  {
    key: 'legal',
    label: 'Legal',
    icon: icons.scale,
    iconColor: '#4F46E5',
    iconBg: '#EEF2FF',
    paths: ['/owner/legal'],
    items: [
      { to: '/owner/legal', label: 'Legal Cases' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: icons.settings,
    iconColor: '#475569',
    iconBg: '#F1F5F9',
    paths: ['/owner/staff', '/owner/profile', '/owner/settings'],
    items: [
      { to: '/owner/staff', label: 'Manage Staff' },
      { to: '/owner/profile', label: 'Profile' },
    ],
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/owner/dashboard': 'Dashboard',
  '/owner/properties': 'Properties',
  '/owner/properties/add': 'Add Property',
  '/owner/units': 'Units',
  '/owner/vacant-units': 'Vacant Properties',
  '/owner/tenants': 'Tenant List',
  '/owner/tenants/add': 'Add Tenant',
  '/owner/tenants/previous': 'Previous Tenants',
  '/owner/contracts': 'Contracts',
  '/owner/pdc': 'PDC Cheques',
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
  '/owner/tenancy-res': 'Tenancy Res',
  '/owner/terms': 'Terms',
  '/owner/contract-payables': 'Contract Payables',
  '/owner/bank-accounts': 'Bank Accounts',
  '/owner/settlement-payments': 'Settlement Payments',
  '/owner/reports': 'Reports',
  '/owner/reports/vacant': 'Vacant Report',
  '/owner/settings': 'Settings',
  '/owner/staff': 'Manage Staff',
  '/owner/profile': 'Profile',
}

function resolveTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const match = Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k) && k !== '/owner/dashboard')
  return match ? PAGE_TITLES[match] : 'Owner Portal'
}

export default function OwnerLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // All groups open by default per Paul's screenshot, preserving user collapse toggle
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    properties: true,
    contracts: true,
    inventory: true,
    accounts: true,
    legal: true,
    settings: true,
  })

  const pageTitle = resolveTitle(location.pathname)
  const searchQuery = searchParams.get('q') || ''

  // Ensure active route's group stays open
  useEffect(() => {
    setOpenGroups(current => {
      const next = { ...current }
      ownerMenuGroups.forEach(group => {
        if (group.paths.some(path => location.pathname.startsWith(path))) {
          next[group.key] = true
        }
      })
      return next
    })
  }, [location.pathname])

  const isMenuLinkActive = (target: string) => {
    const [targetPath, targetQuery = ''] = target.split('?')
    if (location.pathname !== targetPath) return false
    const requiredParams = new URLSearchParams(targetQuery)
    if ([...requiredParams.entries()].length === 0) return !location.search
    return [...requiredParams.entries()].every(([key, value]) => searchParams.get(key) === value)
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
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          border-right: 1px solid #E2E8F0;
          box-shadow: 1px 0 8px rgba(15, 23, 42, 0.02);
        }

        .gfh-sidebar::-webkit-scrollbar { width: 5px; }
        .gfh-sidebar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }

        .gfh-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid #F1F5F9;
          background: #FFFFFF;
        }

        .gfh-logo-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
        }

        .gfh-logo-text {
          font-size: 17.5px;
          font-weight: 800;
          color: #10B981;
          line-height: 1.15;
          letter-spacing: -0.015em;
        }

        .gfh-logo-sub {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #94A3B8;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .gfh-sidebar-nav {
          flex: 1;
          padding: 14px 12px 20px;
        }

        /* ── Top Dashboard Item ── */
        .gfh-dashboard-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          margin-bottom: 10px;
          border-radius: 8px;
          color: #334155;
          font-size: 13.5px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .gfh-dashboard-item:hover {
          background: #F0FDF4;
          color: #059669;
        }

        .gfh-dashboard-item.active {
          background: #E8F8F0;
          color: #0F8A67;
          font-weight: 700;
          border: 1px solid #D1FAE5;
        }

        .gfh-dashboard-item.active .gfh-dash-icon {
          color: #0F8A67;
        }

        /* ── Group Toggle Button ── */
        .gfh-nav-group-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          margin: 1px 0;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #0F172A;
          font-size: 13.5px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .gfh-nav-group-toggle:hover {
          background: #F8FAFC;
        }

        .gfh-group-icon-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gfh-nav-group-chevron {
          margin-left: auto;
          display: flex;
          color: #64748B;
          transition: transform 0.2s ease;
        }

        .gfh-nav-group-chevron.closed {
          transform: rotate(-90deg);
        }

        /* ── Submenu Links ── */
        .gfh-nav-submenu {
          display: flex;
          flex-direction: column;
          padding: 2px 0 6px 0;
        }

        .gfh-sub-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 12px 5px 38px;
          margin: 1px 0;
          border-radius: 6px;
          color: #475569;
          font-size: 12.5px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .gfh-sub-item:hover {
          color: #059669;
          background: #F0FDF4;
        }

        .gfh-sub-item.active {
          color: #059669;
          font-weight: 700;
          background: #ECFDF5;
        }

        .gfh-sub-bullet {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #94A3B8;
          flex-shrink: 0;
          transition: background 0.15s ease;
        }

        .gfh-sub-item:hover .gfh-sub-bullet,
        .gfh-sub-item.active .gfh-sub-bullet {
          background: #059669;
        }

        /* ── Footer ── */
        .gfh-sidebar-footer {
          padding: 12px 14px;
          border-top: 1px solid #F1F5F9;
          background: #FFFFFF;
        }

        .gfh-user-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px;
        }

        .gfh-user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #FFFFFF;
          flex-shrink: 0;
        }

        .gfh-user-name {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gfh-user-role {
          font-size: 10px;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        .gfh-logout-btn {
          background: none;
          border: none;
          color: #64748B;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .gfh-logout-btn:hover {
          background: #FEF2F2;
          color: #DC2626;
        }

        /* ── Main Layout ── */
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
          padding: 18px 32px;
          background: #FFFFFF;
          border-bottom: 1px solid #E2E8F0;
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

      {/* ─── SIDEBAR ─── */}
      <aside className={`gfh-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="gfh-sidebar-logo">
          <div className="gfh-logo-icon">
            <Icon path={icons.building} size={20} />
          </div>
          <div>
            <div className="gfh-logo-text">GoFreeHold</div>
            <div className="gfh-logo-sub">Owner Portal</div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="gfh-sidebar-nav">
          {/* 1. Dashboard (Top Highlighted Button) */}
          <NavLink
            to="/owner/dashboard"
            className={({ isActive }) => `gfh-dashboard-item ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="gfh-dash-icon" style={{ display: 'flex' }}>
              <Icon path={icons.dashboard} size={17} />
            </span>
            <span>Dashboard</span>
          </NavLink>

          {/* 2. Organized Menu Groups strictly per Paul Brit's mockup */}
          {ownerMenuGroups.map(group => {
            const isOpen = !!openGroups[group.key]
            return (
              <div key={group.key} style={{ marginBottom: 4 }}>
                <button
                  type="button"
                  className="gfh-nav-group-toggle"
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroups(current => ({ ...current, [group.key]: !current[group.key] }))}
                >
                  <span
                    className="gfh-group-icon-circle"
                    style={{ background: group.iconBg, color: group.iconColor }}
                  >
                    <Icon path={group.icon} size={15} />
                  </span>
                  <span>{group.label}</span>
                  <span className={`gfh-nav-group-chevron ${isOpen ? '' : 'closed'}`}>
                    <Icon path={icons.chevronDown} size={14} />
                  </span>
                </button>

                {isOpen && (
                  <div className="gfh-nav-submenu">
                    {group.items.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={() => `gfh-sub-item ${isMenuLinkActive(item.to) ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="gfh-sub-bullet" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer: User profile & Logout */}
        <div className="gfh-sidebar-footer">
          <div className="gfh-user-row">
            <div className="gfh-user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'R'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="gfh-user-name">{user?.name || 'RMS'}</div>
              <div className="gfh-user-role">OWNER</div>
            </div>
            <button onClick={handleLogout} title="Logout" className="gfh-logout-btn">
              <Icon path={icons.logout} size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="gfh-main-content">
        <header className="gfh-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#10B981', color: '#FFFFFF', border: 'none',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 1px 3px rgba(16, 185, 129, 0.25)', flexShrink: 0,
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
            {/* Topbar Search Bar — on /owner/contracts and /owner/inventory */}
            {(location.pathname === '/owner/contracts' || location.pathname === '/owner/inventory') && (
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
                  placeholder={location.pathname === '/owner/inventory' ? 'Search inventory...' : 'Search contracts...'}
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
                background: '#10B981', color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13,
              }}>
                {user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'OW'}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1 }}>Welcome back,</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {user?.name || 'Owner'}
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
