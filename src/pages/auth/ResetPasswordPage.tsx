import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import AuthShell, { FieldIcon, AUTH_ICONS } from '../../components/auth/AuthShell'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const emailParam = searchParams.get('email')

  const [email, setEmail] = useState(emailParam || '')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== passwordConfirmation) {
      setStatus('error')
      setMessage('Passwords do not match')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      await api.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      })
      setStatus('success')
      setMessage('Password successfully reset! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err: any) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Failed to reset password. The link might be expired.')
    }
  }

  if (!token) {
    return (
      <AuthShell>
        <h2 style={{ color: '#b91c1c' }}>Invalid Link</h2>
        <p className="auth-sub">No reset token provided. Please request a new link.</p>
        <Link to="/forgot-password" className="auth-btn-link">Request New Link</Link>
        <p className="auth-help">Need help? Contact support</p>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <h2>Reset Your Password</h2>
      <p className="auth-sub">Enter your new password below</p>

      {status === 'success' && (
        <div className="auth-alert auth-alert-success" role="status">
          {message}
        </div>
      )}

      {status === 'error' && (
        <div className="auth-alert" role="alert">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div>
          <label className="auth-label" htmlFor="email">Email Address</label>
          <div className="auth-input-wrap">
            <FieldIcon path={AUTH_ICONS.mail} />
            <input
              id="email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!!emailParam}
            />
          </div>
        </div>

        <div>
          <label className="auth-label" htmlFor="password">New Password</label>
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
          <label className="auth-label" htmlFor="passwordConfirmation">Confirm New Password</label>
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

        <button
          type="submit"
          className="auth-submit"
          disabled={status === 'loading' || status === 'success'}
        >
          {status === 'loading' ? (
            <>
              <span className="auth-spinner" />
              Resetting
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <p className="auth-help">Need help? Contact support</p>
      <div className="auth-footer">
        Remembered your password? <Link to="/login" className="auth-link">Sign In</Link>
      </div>
    </AuthShell>
  )
}
