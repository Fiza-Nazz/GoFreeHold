import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const Icon = ({ path, size = 18 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

const icons = {
  chart: 'M3 3v18h18M8 17V9m4 8V5m4 12v-6',
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1',
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  ledger: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  wallet: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  card: 'M2 5h20v14H2V5zm0 5h20M6 15h4',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M3 12h18M3 6h18M3 18h18',
}

/** Same Owner menu items — restyled only to match Admin dark sidebar. */
const ownerNavItems = [
  { section: 'Overview', items: [
    { to: '/owner/dashboard', icon: icons.chart, label: 'Portfolio Overview' },
  ]},
  { section: 'Properties', items: [
    { to: '/owner/properties', icon: icons.building, label: 'My Properties' },
    { to: '/owner/units', icon: icons.door, label: 'Units' },
    { to: '/owner/vacant-units', icon: icons.search, label: 'Vacant Units' },
  ]},
  { section: 'Finance', items: [
    { to: '/owner/ledger', icon: icons.ledger, label: 'Rent Ledger' },
    { to: '/owner/receivables', icon: icons.wallet, label: 'Receivables' },
    { to: '/owner/payments', icon: icons.card, label: 'Payments' },
  ]},
  { section: 'Account', items: [
    { to: '/owner/profile', icon: icons.user, label: 'Profile' },
  ]},
]

const PAGE_TITLES: Record<string, string> = {
  '/owner/dashboard': 'Portfolio Overview',
  '/owner/properties': 'My Properties',
  '/owner/units': 'Units',
  '/owner/vacant-units': 'Vacant Units',
  '/owner/ledger': 'Rent Ledger',
  '/owner/receivables': 'Receivables',
  '/owner/payments': 'Payments',
  '/owner/profile': 'Profile',
}

function resolveTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/owner/properties/')) return 'Property Detail'
  if (pathname.startsWith('/owner/units/')) return 'Unit Detail'
  return 'Owner'
}

export default function OwnerLayout() {
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
