import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { CornerBrackets } from '../../components/gfh/adminTheme'

export default function StaffActivation() {
  const [token] = useState(() => {
    // Check hash fragment first (#token=XYZ)
    const hash = window.location.hash.slice(1)
    if (hash) {
      const hashParams = new URLSearchParams(hash)
      const t = hashParams.get('token')
      if (t) return t
    }
    // Check search query (?token=XYZ)
    const searchParams = new URLSearchParams(window.location.search)
    return searchParams.get('token') || ''
  })

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const passwordsMatch = password.length > 0 && confirm.length > 0 && password === confirm
  const passwordMismatch = confirm.length > 0 && password !== confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match. Please verify.')
      return
    }

    setBusy(true)
    try {
      await api.post('/auth/staff-invitations/accept', {
        token,
        password,
        password_confirmation: confirm,
      })
      setDone(true)
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname)
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : err.response?.data?.message || 'Could not activate account. The invitation link may have expired.'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F6F8FA',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .gfh-act-btn {
          width: 100%;
          height: 46px;
          border: none;
          border-radius: 9px;
          background: #0E5E48;
          color: #FFFFFF;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 14px rgba(14, 94, 72, 0.25);
          transition: all 0.18s ease;
          text-decoration: none;
          box-sizing: border-box;
        }
        .gfh-act-btn:hover:not(:disabled) {
          background: #06382C;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(6, 56, 44, 0.3);
        }
        .gfh-act-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .gfh-act-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .gfh-act-input {
          width: 100%;
          height: 44px;
          padding: 0 44px 0 38px;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          font-size: 13.5px;
          color: #0F172A;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          background: #FFFFFF;
        }
        .gfh-act-input:focus {
          border-color: #0E5E48;
          box-shadow: 0 0 0 3px rgba(14, 94, 72, 0.12);
        }
        .gfh-act-input-error {
          border-color: #DC2626 !important;
        }
        .gfh-act-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: gfh-spin 0.7s linear infinite;
        }
        @keyframes gfh-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '38px 34px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 20px 45px -10px rgba(6, 56, 44, 0.08)',
          boxSizing: 'border-box',
        }}
      >
        <CornerBrackets color="#0E5E48" />

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: '#0E5E48',
              border: '1px solid #18A77A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 14,
              color: '#34D3A5',
              letterSpacing: '0.05em',
              flexShrink: 0,
            }}
          >
            GF
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
              GoFreeHold
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#0E5E48', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Staff Portal Activation
            </div>
          </div>
        </div>

        {/* ── CASE 1: ACTIVATED SUCCESSFULLY ── */}
        {done ? (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: '50%',
                background: '#ECFDF8',
                border: '2px solid #34D3A5',
                color: '#0E5E48',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 8px 24px rgba(14, 94, 72, 0.15)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#F0FDF4',
                color: '#065F46',
                border: '1px solid #BBF7D0',
                padding: '3px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}
            >
              Account Active
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Welcome to the Team!
            </h2>

            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, margin: '0 auto 24px', maxWidth: 330 }}>
              Your staff credentials have been securely activated. You can now sign in to access your assigned portal.
            </p>

            <Link to="/login" className="gfh-act-btn">
              <span>Sign In to Your Account</span>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        ) : !token ? (
          /* ── CASE 2: MISSING / INVALID TOKEN ── */
          <div style={{ textAlign: 'center', padding: '6px 0' }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#FEF2F2',
                border: '2px solid #FECACA',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              Invitation Link Required
            </h2>

            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, margin: '0 auto 22px', maxWidth: 330 }}>
              No activation token was detected. Please open the activation link sent to your email by your Property Owner,
              or request a new invitation.
            </p>

            <Link to="/login" className="gfh-act-btn">
              Return to Sign In
            </Link>
          </div>
        ) : (
          /* ── CASE 3: ACTIVE ACTIVATION FORM ── */
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: '#ECFDF8',
                  color: '#065F46',
                  border: '1px solid #A7F3DC',
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Staff Onboarding
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                Set Up Your Password
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                Create a strong password to activate your staff account.
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  marginBottom: 16,
                }}
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#0E5E48', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8', pointerEvents: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="gfh-act-input"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    maxLength={255}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 11,
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '2px 6px',
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p style={{ fontSize: 11.5, color: '#DC2626', margin: '4px 0 0 2px', fontWeight: 500 }}>
                    Password must be at least 8 characters.
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#0E5E48', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 12, color: '#94A3B8', pointerEvents: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`gfh-act-input${passwordMismatch ? ' gfh-act-input-error' : ''}`}
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 11,
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      fontSize: 11.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '2px 6px',
                    }}
                  >
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordMismatch && (
                  <p style={{ fontSize: 11.5, color: '#DC2626', margin: '4px 0 0 2px', fontWeight: 500 }}>
                    Passwords do not match.
                  </p>
                )}
                {passwordsMatch && (
                  <p style={{ fontSize: 11.5, color: '#065F46', margin: '4px 0 0 2px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Passwords match perfectly
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="gfh-act-btn"
                disabled={busy || password.length < 8 || password !== confirm}
                style={{ marginTop: 8 }}
              >
                {busy ? (
                  <>
                    <span className="gfh-act-spinner" />
                    Activating Account…
                  </>
                ) : (
                  'Activate Account'
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: '#64748B' }}>
              Already activated?{' '}
              <Link to="/login" style={{ color: '#0E5E48', fontWeight: 700, textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

