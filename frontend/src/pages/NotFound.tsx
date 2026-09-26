import { Link } from 'react-router-dom'
import { useAuthStore, getRoleDashboardPath } from '../store/authStore'
import { CornerBrackets } from '../components/gfh/adminTheme'

export default function NotFound() {
  const { user } = useAuthStore()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F6F8FA',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 24,
      }}
    >
      <style>{`
        .gfh-nf-btn {
          transition: all 0.2s ease;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(14, 94, 72, 0.25);
        }
        .gfh-nf-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(14, 94, 72, 0.35);
          background: #0B4636 !important;
        }
        .gfh-nf-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '48px 40px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 45px -10px rgba(6, 56, 44, 0.08)',
        }}
      >
        <CornerBrackets color="#10B981" />

        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 72,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
            marginBottom: 12,
            letterSpacing: '-0.03em',
          }}
        >
          404
        </div>

        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 22,
            fontWeight: 800,
            color: '#0F172A',
            margin: '0 0 10px',
            letterSpacing: '-0.01em',
          }}
        >
          Page Not Found
        </h1>
        <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500, marginBottom: 30, lineHeight: 1.6 }}>
          The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>

        <Link
          to={user ? getRoleDashboardPath(user.role) : '/login'}
          className="gfh-nf-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            padding: '12px 26px',
            background: '#10B981',
            color: '#FFFFFF',
            textDecoration: 'none',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}