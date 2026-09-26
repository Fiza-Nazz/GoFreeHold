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
  wrench: 'M14.7 6.3a4 4 0 1 1-5.66 5.66l-6.36 6.36a1 1 0 0 0 0 1.42l1.58 1.58a1 1 0 0 0 1.42 0l6.36-6.36a4 4 0 0 0 5.66-5.66z',
  note: 'M4 4h13l3 3v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 9h8M8 13h8M8 17h5',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M3 12h18M3 6h18M3 18h18',
}

/** Same Maintenance menu items — restyled to match Admin dark sidebar. */
const maintenanceNavItems = [
  { section: 'Overview', items: [
    { to: '/maintenance/dashboard', icon: icons.chart, label: 'Dashboard' },
  ]},
  { section: 'Work', items: [
    { to: '/maintenance/jobs', icon: icons.wrench, label: 'Assigned Jobs' },
    { to: '/maintenance/complaints', icon: icons.wrench, label: 'Complaints' },
    { to: '/maintenance/daily-report', icon: icons.note, label: 'Daily Report' },
  ]},
  { section: 'Account', items: [
    { to: '/maintenance/profile', icon: icons.user, label: 'Profile' },
  ]},
]

const PAGE_TITLES: Record<string, string> = {
  '/maintenance/jobs': 'Assigned Jobs',
  '/maintenance/dashboard': 'Dashboard',
  '/maintenance/complaints': 'Complaints',
  '/maintenance/daily-report': 'Daily Report',
  '/maintenance/profile': 'Profile',
}

function resolveTitle(pathname: string) {
  return PAGE_TITLES[pathname] || 'Maintenance'
}

export default function MaintenanceLayout() {
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
            <Icon path={icons.wrench} size={20} />
          </div>
          <div>
            <div className="gfh-logo-text">GoFreeHold</div>
            <div className="gfh-logo-sub">Maintenance Portal</div>
          </div>
        </div>

        <nav className="gfh-sidebar-nav">
          {maintenanceNavItems.map((section) => (
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
              <div className="gfh-user-role">Maintenance</div>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#0F8A67', color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13,
              }}>
                {user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'MT'}
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1 }}>Welcome back,</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>
                  {user?.name || 'Maintenance User'}
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
