import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

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
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
}

/** Owner navigation sections strictly matching Admin structure while preserving Owner features */
const ownerNavItems = [
  { section: 'MAIN', items: [
    { to: '/owner/dashboard', icon: icons.dashboard, label: 'Portfolio Overview' },
  ]},
  { section: 'Lease & Expense', items: [
    { to: '/owner/call-logs', icon: icons.phone, label: 'Call Logs' },
    { to: '/owner/payments', icon: icons.card, label: 'Payments' },
    { to: '/owner/ledger', icon: icons.ledger, label: 'Rent Ledger' },
    { to: '/owner/receivables', icon: icons.wallet, label: 'Receivables' },
    { to: '/owner/receivables-categorized', icon: icons.folder, label: 'Categorized Dues' },
    { to: '/owner/service-charges', icon: icons.bolt, label: 'Service Charges' },
    { to: '/owner/financial-tracking', icon: icons.trending, label: 'Financial Tracking' },
    { to: '/owner/settlements', icon: icons.handshake, label: 'Settlements' },
  ]},
  { section: 'Accounts', items: [
    { to: '/owner/contract-payables', icon: icons.wallet, label: 'Contract Payables' },
    { to: '/owner/bank-accounts', icon: icons.bank, label: 'Bank Accounts' },
    { to: '/owner/settlement-payments', icon: icons.card, label: 'Settlement Payments' },
    { to: '/owner/tenancy-res', icon: icons.contracts, label: 'Tenancy Res' },
    { to: '/owner/terms', icon: icons.contracts, label: 'Terms' },
  ]},
  { section: 'Operations', items: [
    { to: '/owner/complaints', icon: icons.wrench, label: 'Maintenance & Complaints' },
    { to: '/owner/jobs', icon: icons.toolbox, label: 'Jobs' },
    { to: '/owner/teams', icon: icons.handshake, label: 'Teams' },
    { to: '/owner/maintenances', icon: icons.wrench, label: 'Maintenances' },
    { to: '/owner/daily-maintenance', icon: icons.toolbox, label: 'Daily Maint. Report' },
    { to: '/owner/inventory', icon: icons.box, label: 'Inventory' },
    { to: '/owner/item-store', icon: icons.box, label: 'Item Store' },
    { to: '/owner/purchase-orders', icon: icons.cart, label: 'Purchase Orders' },
    { to: '/owner/legal', icon: icons.scale, label: 'Legal Cases' },
  ]},
  { section: 'Reports & Settings', items: [
    { to: '/owner/reports', icon: icons.chart, label: 'Reports' },
    { to: '/owner/reports/vacant', icon: icons.building, label: 'Vacant Report' },
    { to: '/owner/settings', icon: icons.settings, label: 'Settings' },
    { to: '/owner/staff', icon: icons.user, label: 'Manage Staff' },
    { to: '/owner/profile', icon: icons.user, label: 'Profile' },
  ]},
]

const ownerMenuGroups = [
  {
    key: 'properties',
    label: 'Properties',
    icon: icons.building,
    paths: ['/owner/properties', '/owner/units', '/owner/vacant-units', '/owner/appliances'],
    items: [
      { to: '/owner/properties/add', icon: icons.building, label: 'Add Property' },
      { to: '/owner/properties', icon: icons.building, label: 'Buildings' },
      { to: '/owner/units', icon: icons.door, label: 'Units' },
      { to: '/owner/vacant-units', icon: icons.search, label: 'Vacant Units' },
      { to: '/owner/appliances', icon: icons.tv, label: 'Home Appliances' },
    ],
  },
  {
    key: 'contracts',
    label: 'Contracts',
    icon: icons.contracts,
    paths: ['/owner/contracts', '/owner/pdc', '/owner/tenants'],
    items: [
      { to: '/owner/contracts?status=active', icon: icons.contracts, label: 'Current Contracts List' },
      { to: '/owner/pdc', icon: icons.bank, label: 'Cheque Details' },
      { to: '/owner/tenants/add', icon: icons.user, label: 'Add Tenant' },
      { to: '/owner/tenants', icon: icons.user, label: 'Tenant List' },
      { to: '/owner/tenants/previous', icon: icons.user, label: 'Previous Tenants List' },
      { to: '/owner/contracts?action=add', icon: icons.contracts, label: 'Tenancy Contract' },
      { to: '/owner/contracts?status=expired', icon: icons.contracts, label: 'Expired Contracts' },
    ],
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/owner/dashboard': 'Portfolio Overview',
  '/owner/properties': 'Properties',
  '/owner/properties/add': 'Add Property',
  '/owner/units': 'Units',
  '/owner/vacant-units': 'Vacant Units',
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    properties: ownerMenuGroups[0].paths.some(path => location.pathname.startsWith(path)),
    contracts: ownerMenuGroups[1].paths.some(path => location.pathname.startsWith(path)),
  })
  const pageTitle = resolveTitle(location.pathname)
  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    setOpenGroups(current => {
      const next = { ...current }
      ownerMenuGroups.forEach(group => {
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
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

        .gfh-app-layout {
          display: flex;
          min-height: 100vh;
          background: #F8F7FD;
          font-family: 'Poppins', system-ui, sans-serif;
        }

        .gfh-sidebar {
          width: 250px;
          min-width: 250px;
          background: #06382C;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
        }

        .gfh-sidebar::-webkit-scrollbar { width: 5px; }
        .gfh-sidebar::-webkit-scrollbar-thumb { background: #0E5E48; border-radius: 4px; }

        .gfh-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 22px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: #042B22;
        }

        .gfh-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: rgba(52, 211, 165, 0.12);
          border: 1px solid rgba(52, 211, 165, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #34D3A5;
          flex-shrink: 0;
        }

        .gfh-logo-text {
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }

        .gfh-logo-sub {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #A7F3DC;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .gfh-sidebar-nav {
          flex: 1;
          padding: 14px 12px 20px;
        }

        .gfh-nav-section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #6EE7C4;
          opacity: 0.9;
          padding: 18px 12px 8px;
        }

        .gfh-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          margin: 3px 0;
          border-radius: 8px;
          color: #D1FAEE;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .gfh-nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .gfh-nav-item.active {
          background: #0E5E48;
          color: #ffffff;
          font-weight: 700;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .gfh-nav-item.active .gfh-nav-icon {
          color: #34D3A5;
        }

        .gfh-nav-group-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          margin: 3px 0;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #D1FAEE;
          font-size: 13.5px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
        }

        .gfh-nav-group-toggle:hover,
        .gfh-nav-group-toggle.current {
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
        }

        .gfh-nav-group-toggle.current {
          border-color: rgba(167, 243, 220, 0.35);
        }

        .gfh-nav-group-chevron {
          margin-left: auto;
          display: flex;
          transition: transform 0.18s ease;
        }

        .gfh-nav-group-chevron.open { transform: rotate(90deg); }

        .gfh-nav-submenu {
          margin: 2px 0 7px 17px;
          padding-left: 10px;
          border-left: 1px solid rgba(167, 243, 220, 0.22);
        }

        .gfh-nav-submenu .gfh-nav-item {
          padding: 8px 10px;
          gap: 9px;
          font-size: 12.5px;
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
          padding: 14px 14px;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: #042B22;
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
          background: #18A77A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .gfh-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gfh-user-role {
          font-size: 10px;
          color: #A7F3DC;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .gfh-logout-btn {
          background: none;
          border: none;
          color: #A7F3DC;
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
          background: #F8F7FD;
        }

        .gfh-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          background: #ffffff;
          border-bottom: 1px solid #E2E8F0;
        }

        .gfh-page-title {
          font-size: 20px;
          font-weight: 800;
          color: #111827;
          margin: 0;
        }

        .gfh-mobile-menu-btn {
          background: none;
          border: none;
          color: #111827;
          cursor: pointer;
          display: none;
          padding: 4px;
        }

        .gfh-page-content {
          flex: 1;
          padding: 24px 28px;
          background: #F8F7FD;
          animation: gfhFadeIn 0.35s ease;
        }

        @keyframes gfhFadeIn {
          from { opacity: 0; transform: translateY(6px); }
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
            <Icon path={icons.building} size={20} />
          </div>
          <div>
            <div className="gfh-logo-text">GoFreeHold</div>
            <div className="gfh-logo-sub">Owner Portal</div>
          </div>
        </div>

        <nav className="gfh-sidebar-nav">
          {ownerNavItems.map((section) => (
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
              {section.section === 'MAIN' && ownerMenuGroups.map(group => {
                const isOpen = openGroups[group.key]
                const isCurrent = group.paths.some(path => location.pathname.startsWith(path))
                return (
                  <div key={group.key}>
                    <button
                      type="button"
                      className={`gfh-nav-group-toggle ${isCurrent ? 'current' : ''}`}
                      aria-expanded={isOpen}
                      aria-controls={`owner-${group.key}-submenu`}
                      onClick={() => setOpenGroups(current => ({ ...current, [group.key]: !current[group.key] }))}
                    >
                      <span className="gfh-nav-icon"><Icon path={group.icon} /></span>
                      <span>{group.label}</span>
                      <span className={`gfh-nav-group-chevron ${isOpen ? 'open' : ''}`}><Icon path={icons.chevron} size={15} /></span>
                    </button>
                    {isOpen && (
                      <div id={`owner-${group.key}-submenu`} className="gfh-nav-submenu">
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
              {user?.name?.charAt(0).toUpperCase() || 'O'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="gfh-user-name">{user?.name || 'Owner'}</div>
              <div className="gfh-user-role">Owner</div>
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
                width: 32, height: 32, borderRadius: '50%',
                background: '#0F8A67', color: '#FFFFFF', border: 'none',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 1px 3px rgba(15, 138, 103, 0.25)', flexShrink: 0,
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
                    fontFamily: "'Poppins', system-ui, sans-serif",
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
