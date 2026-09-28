import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AuthShell, { FieldIcon, PasswordEyeIcon, AUTH_ICONS } from '../../components/auth/AuthShell'

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
    <AuthShell>
      {/* ── CASE 1: ACTIVATED SUCCESSFULLY ── */}
      {done ? (
        <>
          <h2>Welcome to the Team!</h2>
          <p className="auth-sub">
            Your staff credentials have been securely activated. You can now sign in to access your assigned portal.
          </p>
          <div className="auth-alert auth-alert-success" role="status">
            Account Activated Successfully
          </div>
          <Link to="/login" className="auth-btn-link">
            Sign In to Your Account
          </Link>
          <p className="auth-help">Need help? Contact support</p>
        </>
      ) : !token ? (
        /* ── CASE 2: MISSING / INVALID TOKEN ── */
        <>
          <h2 style={{ color: '#b91c1c' }}>Invitation Link Required</h2>
          <p className="auth-sub">
            No activation token was detected. Please open the activation link sent to your email by your Property Owner, or request a new invitation.
          </p>
          <Link to="/login" className="auth-btn-link">
            Return to Sign In
          </Link>
          <p className="auth-help">Need help? Contact support</p>
        </>
      ) : (
        /* ── CASE 3: ACTIVE ACTIVATION FORM ── */
        <>
          <h2>Set Up Your Password</h2>
          <p className="auth-sub">
            Create a strong password to activate your staff account
          </p>

          {error && (
            <div className="auth-alert" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Password */}
            <div>
              <label htmlFor="staff-password" className="auth-label">New Password</label>
              <div className="auth-input-wrap">
                <FieldIcon path={AUTH_ICONS.lock} />
                <input
                  id="staff-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={255}
                  required
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <PasswordEyeIcon visible={showPassword} />
                </button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0 2px', fontWeight: 500 }}>
                  Password must be at least 8 characters.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="staff-confirm" className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <FieldIcon path={AUTH_ICONS.lock} />
                <input
                  id="staff-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <PasswordEyeIcon visible={showConfirm} />
                </button>
              </div>
              {passwordMismatch && (
                <p style={{ fontSize: 12, color: '#DC2626', margin: '4px 0 0 2px', fontWeight: 500 }}>
                  Passwords do not match.
                </p>
              )}
              {passwordsMatch && (
                <p style={{ fontSize: 12, color: '#059669', margin: '4px 0 0 2px', fontWeight: 600 }}>
                  Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              className="auth-btn-submit"
              disabled={busy || password.length < 8 || password !== confirm}
            >
              {busy ? 'Activating Account…' : 'Activate Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already activated? <Link to="/login">Sign In</Link>
          </p>

          <p className="auth-help">Need help? Contact support</p>
        </>
      )}
    </AuthShell>
  )
}



