import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

/* ── Simple inline SVG icon set (no external deps) ────────────────── */
const Icon = ({ path, size = 18 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

const icons = {
  dashboard: 'M3 3h8v8H3V3zm10 0h8v5h-8V3zm0 9h8v9h-8v-9zM3 13h8v8H3v-8z',
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
}

/** Real Admin routes only — grouped like the reference Modules / Lease / Accounts pattern. */
const adminNavItems = [
  { section: 'Modules', items: [
    { to: '/admin/dashboard', icon: icons.dashboard, label: 'Dashboard' },
    { to: '/admin/properties', icon: icons.building, label: 'Properties' },
    { to: '/admin/units', icon: icons.door, label: 'Units' },
    { to: '/admin/contracts', icon: icons.contracts, label: 'Contracts' },
  ]},
  { section: 'Lease & Expense', items: [
    { to: '/admin/pdc', icon: icons.bank, label: 'PDC Cheques' },
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
    { to: '/admin/appliances', icon: icons.tv, label: 'Appliances' },
    { to: '/admin/purchase-orders', icon: icons.cart, label: 'Purchase Orders' },
    { to: '/admin/legal', icon: icons.scale, label: 'Legal Cases' },
  ]},
  { section: 'Reports', items: [
    { to: '/admin/reports', icon: icons.chart, label: 'Reports' },
    { to: '/admin/reports/vacant', icon: icons.building, label: 'Vacant Report' },
    { to: '/admin/settings', icon: icons.settings, label: 'Settings' },
  ]},
]

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/properties': 'Properties',
  '/admin/units': 'Units',
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pageTitle = resolveTitle(location.pathname)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="gfh-app-layout">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .gfh-app-layout {
          display: flex;
          min-height: 100vh;
          background: #ffffff;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .gfh-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: #0f172a;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
        }

        .gfh-sidebar::-webkit-scrollbar { width: 5px; }
        .gfh-sidebar::-webkit-scrollbar-thumb { background: #334155; border-radius: 0; }

        .gfh-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 22px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .gfh-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 0;
          background: #991b1b;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }

        .gfh-logo-text {
          font-size: 17px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
        }

        .gfh-logo-sub {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.1px;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .gfh-sidebar-nav {
          flex: 1;
          padding: 14px 10px 20px;
        }

        .gfh-nav-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.1px;
          text-transform: uppercase;
          color: #64748b;
          padding: 16px 12px 8px;
        }

        .gfh-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          margin: 2px 0;
          border-radius: 0;
          color: #cbd5e1;
          font-size: 13.5px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .gfh-nav-item:hover {
          background: rgba(255,255,255,0.06);
          color: #ffffff;
        }

        .gfh-nav-item.active {
          background: #991b1b;
          color: #ffffff;
          font-weight: 700;
        }

        .gfh-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          opacity: 0.95;
        }

        .gfh-sidebar-footer {
          padding: 14px 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .gfh-user-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 0;
        }

        .gfh-user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
        }

        .gfh-user-name {
          font-size: 12.5px;
          font-weight: 600;
          color: #f1f5f9;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gfh-user-role {
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .gfh-logout-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 0;
          display: flex;
        }

        .gfh-logout-btn:hover {
          background: rgba(248,113,113,0.15);
          color: #f87171;
        }

        .gfh-main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #ffffff;
        }

        .gfh-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 28px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 10;
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

        .gfh-welcome-text {
          font-size: 13px;
          color: #6b7280;
        }

        .gfh-welcome-name {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
        }

        .gfh-page-content {
          flex: 1;
          padding: 24px 28px;
          background: #ffffff;
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
            <Icon path="M3 12 12 3l9 9M5 10v10h14V10" size={18} />
          </div>
          <div>
            <div className="gfh-logo-text">GoFreeHold</div>
            <div className="gfh-logo-sub">Admin Portal</div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="gfh-mobile-menu-btn"
            >
              <Icon path={icons.menu} size={22} />
            </button>
            <h1 className="gfh-page-title">{pageTitle}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="gfh-welcome-text">Welcome back,</span>
            <span className="gfh-welcome-name">{user?.name}</span>
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
