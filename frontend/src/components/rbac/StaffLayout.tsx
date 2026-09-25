import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import './rbac.css'

export default function StaffLayout() {
  const { user, logout } = useAuthStore()
  const base = '/' + user?.role

  const navItems = [
    { path: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: 'units', label: 'Units', icon: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12' },
    { path: 'contracts', label: 'Contracts', icon: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4' },
    { path: 'payments', label: 'Payments', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: 'payments/new', label: 'Record Payment', icon: 'M12 4v16m8-8H4' },
    { path: 'receivables', label: 'Receivables', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    ...(user?.role === 'accountant' ? [{ path: 'ledger', label: 'Rent Ledger', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }] : []),
    { path: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
  ]

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'ST'

  return (
    <div className="rbac-shell">
      <aside className="rbac-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: 'rgba(52, 211, 165, 0.15)',
            border: '1px solid rgba(52, 211, 165, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34D3A5',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12" />
            </svg>
          </div>
          <div>
            <strong style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', display: 'block', lineHeight: 1.1 }}>GoFreeHold</strong>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#A7F3DC', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {user?.role} portal
            </span>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <NavLink
              end
              key={item.path}
              to={base + '/' + item.path}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="rbac-main">
        <header className="rbac-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#0E5E48',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
              boxShadow: '0 2px 6px rgba(14, 94, 72, 0.25)',
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1 }}>Welcome back,</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                {user?.name}
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  background: '#ECFDF8',
                  color: '#065F46',
                  border: '1px solid #A7F3DC',
                  padding: '2px 7px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => void logout()}
            className="rbac-logout-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </header>

        <Outlet key={user?.id} />
      </div>
    </div>
  )
}
