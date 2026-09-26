import { Link } from 'react-router-dom'
import { useAuthStore, getRoleDashboardPath } from '../store/authStore'

export default function Unauthorized() {
  const { user, logout } = useAuthStore()

  const roleName = user?.role ? user.role.toUpperCase() : 'USER'
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'GF'

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #ECFDF8 0%, #F8FAFC 70%)',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 24,
      }}
    >
      <style>{`
        .gfh-unauth-card {
          animation: gfhSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes gfhSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .gfh-btn-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .gfh-btn-hover:hover {
          transform: translateY(-2px);
        }
        .gfh-btn-hover:active {
          transform: translateY(0);
        }
      `}</style>

      <div
        className="gfh-unauth-card"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 24,
          padding: '44px 38px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.03)',
        }}
      >
        {/* Soft Glowing Security Icon */}
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.18)',
            color: '#DC2626',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* 403 Pill Badge */}
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              padding: '4px 12px',
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626' }} />
            403 · Access Restricted
          </span>
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 10px',
            letterSpacing: '-0.02em',
          }}
        >
          Permission Denied
        </h1>

        <p
          style={{
            fontSize: 14,
            color: '#64748B',
            lineHeight: 1.6,
            margin: '0 0 24px',
            padding: '0 10px',
          }}
        >
          You do not have authorization to view this section with your current account privileges.
        </p>

        {/* Active Account Identity Card */}
        {user && (
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 28,
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748B' }}>
                  Signed in
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: '#ECFDF8',
                color: '#065F46',
                border: '1px solid #A7F3DC',
                padding: '3px 9px',
                borderRadius: 999,
                letterSpacing: '0.4px',
              }}
            >
              {roleName}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link
            to={user ? getRoleDashboardPath(user.role) : '/login'}
            className="gfh-btn-hover"
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: 700,
              padding: '12px 18px',
              background: '#10B981',
              color: '#FFFFFF',
              borderRadius: 10,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Return to Dashboard
          </Link>

          <button
            onClick={() => void logout()}
            className="gfh-btn-hover"
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '12px 18px',
              background: '#FFFFFF',
              color: '#64748B',
              border: '1px solid #CBD5E1',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 11.5, color: '#94A3B8' }}>
          GoFreeHold Role-Based Security Policy
        </div>
      </div>
    </div>
  )
}
