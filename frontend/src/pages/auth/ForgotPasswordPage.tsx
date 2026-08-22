import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AuthShell, { FieldIcon, AUTH_ICONS } from '../../components/auth/AuthShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const res = await api.post('/auth/forgot-password', { email })
      setStatus('success')
      setMessage(res.data.message || 'Password reset link sent to your email.')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Failed to send reset link. Please check the email provided.')
    }
  }

  return (
    <AuthShell>
      <h2>Forgot Password?</h2>
      <p className="auth-sub">Enter your email to receive a password reset link</p>

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
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="auth-submit" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <span className="auth-spinner" />
              Sending
            </>
          ) : (
            'Send Reset Link'
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
