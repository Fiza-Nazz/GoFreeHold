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
  wallet: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  receipt: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M3 12h18M3 6h18M3 18h18',
}

/** Same Tenant menu items — restyled only to match Admin dark sidebar. */
const tenantNavItems = [
  { section: 'My Dashboard', items: [
    { to: '/tenant/dashboard', icon: icons.dashboard, label: 'Dashboard' },
  ]},
  { section: 'Dues & Payments', items: [
    { to: '/tenant/dues', icon: icons.wallet, label: 'Rent & DEWA Dues' },
    { to: '/tenant/payments', icon: icons.receipt, label: 'Payment History' },
  ]},
  { section: 'Support', items: [
    { to: '/tenant/complaints', icon: icons.wrench, label: 'My Complaints' },
  ]},
  { section: 'Account', items: [
    { to: '/tenant/profile', icon: icons.user, label: 'My Profile' },
  ]},
]

const PAGE_TITLES: Record<string, string> = {
  '/tenant/dashboard': 'Dashboard',
  '/tenant/dues': 'Rent & DEWA Dues',
  '/tenant/payments': 'Payment History',
  '/tenant/complaints': 'My Complaints',
  '/tenant/profile': 'My Profile',
}

function resolveTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/tenant/complaints/')) return 'Complaint Detail'
  return 'Tenant'
}

export default function TenantLayout() {
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
        }

        .gfh-sidebar::-webkit-scrollbar { width: 5px; }
        .gfh-sidebar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }

        .gfh-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 20px;
          border-bottom: 1px solid #E2E8F0;
          background: #FFFFFF;
        }

        .gfh-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #10B981;
          border: 1px solid #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
        }

        .gfh-logo-text {
          font-size: 18px;
          font-weight: 800;
          color: #10B981;
          line-height: 1.2;
          letter-spacing: -0.015em;
        }

        .gfh-logo-sub {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #64748B;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .gfh-sidebar-nav {
          flex: 1;
          padding: 14px 12px 20px;
        }

        .gfh-nav-section-label {
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #94A3B8;
          padding: 20px 14px 8px;
        }

        .gfh-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          margin: 2px 0;
          border-radius: 8px;
          color: #334155;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.45;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .gfh-nav-item:hover {
          background: #ECFDF5;
          color: #059669;
        }

        .gfh-nav-item.active {
          background: #10B981;
          color: #FFFFFF;
          font-weight: 600;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
        }

        .gfh-nav-item.active .gfh-nav-icon {
          color: #FFFFFF;
        }

        .gfh-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #64748B;
        }

        .gfh-nav-item:hover .gfh-nav-icon {
          color: #059669;
        }

        .gfh-sidebar-footer {
          padding: 14px;
          border-top: 1px solid #E2E8F0;
          background: #F8FAFC;
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
          background: #10B981;
          border: 1px solid #059669;
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
          color: #0F172A;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gfh-user-role {
          font-size: 11px;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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

      <aside className={`gfh-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="gfh-sidebar-logo">
          <div className="gfh-logo-icon">
            <Icon path={icons.user} size={20} />
          </div>
          <div>
            <div className="gfh-logo-text">GoFreeHold</div>
            <div className="gfh-logo-sub">Tenant Portal</div>
          </div>
        </div>

        <nav className="gfh-sidebar-nav">
          {tenantNavItems.map((section) => (
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
              <div className="gfh-user-role">Tenant</div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#10B981', color: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13,
            }}>
              {user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'TN'}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1 }}>Welcome back,</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                {user?.name || 'Tenant'}
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
