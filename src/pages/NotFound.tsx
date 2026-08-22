import { Link } from 'react-router-dom'
import { useAuthStore, getRoleDashboardPath } from '../store/authStore'

export default function NotFound() {
  const { user } = useAuthStore()

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

        .gfh-nf-btn {
          transition: transform 0.2s cubic-bezier(.2,.8,.2,1), box-shadow 0.2s cubic-bezier(.2,.8,.2,1);
          box-shadow: 0 4px 14px rgba(46,16,101,0.35), 0 2px 0 #1a0a30;
        }
        .gfh-nf-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 22px rgba(46,16,101,0.45), 0 2px 0 #1a0a30;
        }
        .gfh-nf-btn:active {
          transform: translateY(0) scale(0.96);
          box-shadow: 0 3px 8px rgba(46,16,101,0.4), 0 1px 0 #1a0a30;
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

        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 68,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1e0a3c 0%, #6d28d9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          404
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#1c1917',
            margin: '0 0 12px',
            letterSpacing: '0.2px',
          }}
        >
          Page not found
        </h1>
        <p style={{ fontSize: 14.5, color: '#57534e', fontWeight: 500, marginBottom: 28, lineHeight: 1.6 }}>
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link
          to={user ? getRoleDashboardPath(user.role) : '/login'}
          className="gfh-nf-btn"
          style={{
            display: 'inline-block',
            borderRadius: 4,
            fontSize: 13.5,
            fontWeight: 700,
            padding: '11px 24px',
            background: 'linear-gradient(135deg, #1e0a3c 0%, #2e1065 100%)',
            color: '#fff',
            textDecoration: 'none',
          }}
        >
          Return home
        </Link>
      </div>
    </div>
  )
}