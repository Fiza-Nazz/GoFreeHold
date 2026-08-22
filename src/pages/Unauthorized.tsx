import { Link } from 'react-router-dom'
import { useAuthStore, getRoleDashboardPath } from '../store/authStore'

export default function Unauthorized() {
  const { user, logout } = useAuthStore()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#faf9fb',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        padding: 20,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');

        .gfh-unauth-btn {
          transition: transform 0.2s cubic-bezier(.2,.8,.2,1), box-shadow 0.2s cubic-bezier(.2,.8,.2,1), filter 0.2s ease;
        }
        .gfh-unauth-btn:hover { transform: translateY(-2px); }
        .gfh-unauth-btn:active { transform: translateY(0) scale(0.96); }

        .gfh-unauth-btn-solid {
          box-shadow: 0 4px 14px rgba(46,16,101,0.35), 0 2px 0 #1a0a30;
        }
        .gfh-unauth-btn-solid:hover {
          box-shadow: 0 10px 22px rgba(46,16,101,0.45), 0 2px 0 #1a0a30;
        }

        .gfh-unauth-btn-logout {
          box-shadow: 0 3px 10px rgba(220,38,38,0.15), 0 2px 0 rgba(220,38,38,0.2);
          transition: transform 0.2s cubic-bezier(.2,.8,.2,1), box-shadow 0.2s cubic-bezier(.2,.8,.2,1), background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .gfh-unauth-btn-logout:hover {
          transform: translateY(-3px);
          background: #fee2e2;
          border-color: #fca5a5;
          box-shadow: 0 10px 22px -2px rgba(220,38,38,0.35), 0 2px 0 rgba(220,38,38,0.25);
        }
        .gfh-unauth-btn-logout:active {
          transform: translateY(0) scale(0.96);
          box-shadow: 0 2px 6px rgba(220,38,38,0.25), 0 1px 0 rgba(220,38,38,0.2);
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          background: '#fff',
          border: '1px solid #ece4fb',
          borderRadius: 4,
          padding: '44px 40px',
          maxWidth: 460,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 50px -12px rgba(46,16,101,0.15)',
        }}
      >
        <span style={{ position: 'absolute', top: -1, left: -1, width: 16, height: 16, borderTop: '2px solid #a855f7', borderLeft: '2px solid #a855f7' }} />
        <span style={{ position: 'absolute', top: -1, right: -1, width: 16, height: 16, borderTop: '2px solid #a855f7', borderRight: '2px solid #a855f7' }} />
        <span style={{ position: 'absolute', bottom: -1, left: -1, width: 16, height: 16, borderBottom: '2px solid #a855f7', borderLeft: '2px solid #a855f7' }} />
        <span style={{ position: 'absolute', bottom: -1, right: -1, width: 16, height: 16, borderBottom: '2px solid #a855f7', borderRight: '2px solid #a855f7' }} />

        {/* Icon badge */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e0a3c 0%, #2e1065 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 22px',
            boxShadow: '0 8px 20px -4px rgba(46,16,101,0.4)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 26,
            fontWeight: 700,
            color: '#1c1917',
            margin: 0,
            letterSpacing: '0.2px',
          }}
        >
          Access denied
        </h1>
        <p style={{ fontSize: 14.5, color: '#57534e', fontWeight: 500, marginTop: 12, marginBottom: 28, lineHeight: 1.6 }}>
          You don't have permission to view this page based on your role
          {user?.role ? (
            <> (<strong style={{ color: '#3b0764' }}>{user.role}</strong>)</>
          ) : null}
          .
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to={user ? getRoleDashboardPath(user.role) : '/login'}
            className="gfh-unauth-btn gfh-unauth-btn-solid"
            style={{
              borderRadius: 4,
              fontSize: 13.5,
              fontWeight: 700,
              padding: '11px 20px',
              background: 'linear-gradient(135deg, #1e0a3c 0%, #2e1065 100%)',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            Go to my dashboard
          </Link>
          <button
            onClick={logout}
            className="gfh-unauth-btn gfh-unauth-btn-logout"
            style={{
              borderRadius: 4,
              fontSize: 13.5,
              fontWeight: 700,
              padding: '11px 20px',
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}