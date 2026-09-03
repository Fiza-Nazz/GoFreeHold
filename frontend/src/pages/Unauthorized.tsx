import { Link } from 'react-router-dom'
import { useAuthStore, getRoleDashboardPath } from '../store/authStore'
import { CornerBrackets, THEME } from '../components/gfh/adminTheme'

export default function Unauthorized() {
  const { user, logout } = useAuthStore()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F7FD',
        fontFamily: "'Poppins', system-ui, sans-serif",
        padding: 24,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

        .gfh-unauth-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-radius: 0;
          font-family: 'Poppins', sans-serif;
        }
        .gfh-unauth-btn:hover { transform: translateY(-2px); }
        .gfh-unauth-btn:active { transform: translateY(0); }

        .gfh-unauth-btn-solid {
          box-shadow: 0 4px 14px rgba(36, 0, 70, 0.25);
        }
        .gfh-unauth-btn-solid:hover {
          box-shadow: 0 8px 20px rgba(36, 0, 70, 0.35);
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 0,
          padding: '48px 40px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 45px -10px rgba(24, 0, 46, 0.1)',
        }}
      >
        <CornerBrackets color="#240046" />

        {/* Icon badge */}
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 0,
            background: 'linear-gradient(135deg, #18002E 0%, #240046 100%)',
            border: '1px solid #5A189A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 20px rgba(36, 0, 70, 0.3)',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: '#18002E',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          Access Denied
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500, marginTop: 12, marginBottom: 30, lineHeight: 1.6 }}>
          You do not have administrative permissions to view this section based on your current account role
          {user?.role ? (
            <> (<strong style={{ color: '#240046', textTransform: 'uppercase' }}>{user.role}</strong>)</>
          ) : null}
          .
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to={user ? getRoleDashboardPath(user.role) : '/login'}
            className="gfh-unauth-btn gfh-unauth-btn-solid"
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #18002E 0%, #240046 100%)',
              color: '#FFFFFF',
              textDecoration: 'none',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Go To My Dashboard
          </Link>
          <button
            onClick={logout}
            className="gfh-unauth-btn"
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              padding: '12px 22px',
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
