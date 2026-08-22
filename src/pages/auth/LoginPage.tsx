import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, getRoleDashboardPath } from '../../store/authStore'
import AuthShell, { FieldIcon, AUTH_ICONS } from '../../components/auth/AuthShell'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const passwordRef = useRef<HTMLInputElement>(null)

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const emailShowsError = emailTouched && email.length > 0 && !emailIsValid

  const handlePasswordKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockOn(e.getModifierState('CapsLock'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(email, password, rememberMe)
      const role = useAuthStore.getState().user?.role
      if (role) {
        navigate(getRoleDashboardPath(role))
      }
    } catch {
      // Error handled in store
    }
  }

  return (
    <AuthShell>
      <h2>Welcome Back</h2>
      <p className="auth-sub">Sign in to your GoFreeHold account</p>

      {error && <div className="auth-alert" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div>
          <label className="auth-label" htmlFor="email">Email address</label>
          <div className="auth-input-wrap">
            <FieldIcon path={AUTH_ICONS.mail} />
            <input
              id="email"
              type="email"
              className={`auth-input${emailShowsError ? ' auth-input-error' : ''}`}
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              aria-invalid={emailShowsError}
              required
            />
          </div>
          {emailShowsError && (
            <p className="auth-field-error">Enter a valid email address.</p>
          )}
        </div>

        <div>
          <label className="auth-label" htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <FieldIcon path={AUTH_ICONS.lock} />
            <input
              ref={passwordRef}
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={handlePasswordKey}
              onKeyDown={handlePasswordKey}
              required
              style={{ paddingRight: 56 }}
            />
            <button
              type="button"
              className="auth-toggle-pw"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {capsLockOn && <p className="auth-caps">Caps lock is on.</p>}
        </div>

        <div className="auth-row">
          <label className="auth-remember" htmlFor="remember">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me for 30 days
          </label>
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </div>

        <button type="submit" className="auth-submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="auth-spinner" />
              Signing in
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="auth-help">Need help? Contact support</p>
      <div className="auth-footer">
        Don't have an account? <Link to="/register" className="auth-link">Create Account</Link>
      </div>
    </AuthShell>
  )
}
