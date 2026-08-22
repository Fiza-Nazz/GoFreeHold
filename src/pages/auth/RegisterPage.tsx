import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { UserRole } from '../../types'
import api from '../../api/axios'
import { useAuthStore, getRoleDashboardPath } from '../../store/authStore'
import ReCAPTCHA from 'react-google-recaptcha'
import AuthShell, { FieldIcon, AUTH_ICONS } from '../../components/auth/AuthShell'

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'tenant', label: 'Tenant' },
  { value: 'owner', label: 'Property Owner' },
  { value: 'maintenance', label: 'Maintenance Staff' },
  { value: 'admin', label: 'Administrator' },
]

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [role, setRole] = useState<UserRole>('tenant')
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      setError('Passwords do not match')
      return
    }

    if (!recaptchaToken) {
      setError('Please verify you are human')
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
        recaptcha_token: recaptchaToken,
      })

      const { user, token } = response.data.data

      // Align with login Remember Me defaults: sessionStorage for new registrations
      sessionStorage.setItem('gfh_token', token)
      sessionStorage.setItem('gfh_user', JSON.stringify(user))
      localStorage.removeItem('gfh_token')
      localStorage.removeItem('gfh_user')
      localStorage.removeItem('auth_token') // legacy key cleanup

      setUser(user)
      useAuthStore.setState({
        token,
        isAuthenticated: true,
        rememberMe: false,
        isLoading: false,
        error: null,
      })

      navigate(getRoleDashboardPath(user.role))
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors
      const firstError = apiErrors ? Object.values(apiErrors).flat()[0] : null
      setError(
        (firstError as string) ||
          err.response?.data?.message ||
          'Registration failed. Please check your inputs.'
      )
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <h2>Create Account</h2>
      <p className="auth-sub">Join GoFreeHold and manage your property portfolio</p>

      {error && (
        <div className="auth-alert" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div>
          <label className="auth-label" htmlFor="name">Full Name</label>
          <div className="auth-input-wrap">
            <FieldIcon path={AUTH_ICONS.user} />
            <input
              id="name"
              type="text"
              className="auth-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="auth-label" htmlFor="email">Email Address</label>
          <div className="auth-input-wrap">
            <FieldIcon path={AUTH_ICONS.mail} />
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="auth-label" htmlFor="role">Account Role</label>
          <div className="auth-input-wrap">
            <FieldIcon path={AUTH_ICONS.role} />
            <select
              id="role"
              className="auth-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="auth-grid-2">
          <div>
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <FieldIcon path={AUTH_ICONS.lock} />
              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>
          <div>
            <label className="auth-label" htmlFor="passwordConfirmation">Confirm Password</label>
            <div className="auth-input-wrap">
              <FieldIcon path={AUTH_ICONS.lock} />
              <input
                id="passwordConfirmation"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="auth-recaptcha">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => setRecaptchaToken(token)}
            theme="light"
          />
        </div>

        <button type="submit" className="auth-submit" disabled={isLoading || !recaptchaToken}>
          {isLoading ? (
            <>
              <span className="auth-spinner" />
              Creating account
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="auth-help">Need help? Contact support</p>
      <div className="auth-footer">
        Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
      </div>
    </AuthShell>
  )
}
