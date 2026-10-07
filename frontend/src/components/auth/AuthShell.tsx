import type { ReactNode } from 'react'

/** Shared visual shell for Login / Register / Forgot / Reset / StaffActivation — presentation only. */
const FEATURES = [
  {
    label: 'Portfolio & Unit Drill-down',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  },
  {
    label: 'UAE Tenancy Contracts & PDC Cheques',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h6',
  },
  {
    label: 'Automated Ledgers & Maintenance',
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
]

export const authShellCss = `
  :root {
    --auth-brand-deep: #059669;
    --auth-brand-dark: #047857;
    --auth-brand-mid: #059669;
    --auth-brand-light: #10B981;
    --auth-brand-accent: #059669;
    --auth-canvas: #FAFAFA;
    --auth-card-border: #F1F5F9;
    --auth-card-bg: #FFFFFF;
    --auth-ink: #1E293B;
    --auth-muted: #64748B;
    --auth-line: #E2E8F0;
    --auth-input-bg: #FFFFFF;
    --auth-input-border: #E2E8F0;
    --auth-danger: #DC2626;
    --auth-danger-bg: #FEF2F2;
    --auth-danger-border: #FECACA;
    --auth-success: #059669;
    --auth-success-bg: #ECFDF5;
    --auth-success-border: #A7F3D0;
  }

  * {
    box-sizing: border-box;
    font-family: 'Source Sans Pro', system-ui, -apple-system, sans-serif;
  }

  .auth-shell {
    min-height: 100vh;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Source Sans Pro', system-ui, -apple-system, sans-serif;
    background: var(--auth-canvas);
    color: var(--auth-ink);
  }

  /* ── LEFT PANEL (ARCHITECTURAL HERO PHOTO + SKY) ── */
  .auth-left {
    background-color: #EAF2FA;
    background-image: url('/clean-login-hero.jpg');
    background-repeat: no-repeat;
    background-position: right bottom;
    background-size: cover;
    color: #1E293B;
    padding: 52px 64px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    overflow: hidden;
  }

  .auth-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 2;
  }

  .auth-logo-house {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #059669;
    flex-shrink: 0;
  }

  .auth-brand-name {
    font-size: 19px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: #1E293B;
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }

  .auth-brand-sub {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #64748B;
    margin-top: 4px;
  }

  .auth-hero-wrap {
    margin-top: 92px;
    max-width: 440px;
    position: relative;
    z-index: 2;
  }

  .auth-left h1 {
    font-size: 40px;
    font-weight: 600;
    line-height: 1.18;
    margin: 0 0 18px;
    color: #1E293B;
    letter-spacing: -0.025em;
  }

  .auth-left-support {
    font-size: 14.5px;
    line-height: 1.6;
    color: #64748B;
    margin: 0 0 30px;
    max-width: 390px;
    font-weight: 400;
  }

  .auth-features {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .auth-features li {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 13.5px;
    font-weight: 600;
    color: #1E293B;
  }

  .auth-feature-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(209, 250, 229, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #059669;
  }

  /* ── RIGHT FORM PANEL ── */
  .auth-right {
    background: var(--auth-canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 32px;
  }

  .auth-form-card {
    width: 100%;
    max-width: 420px;
    background: var(--auth-card-bg);
    border: 1px solid var(--auth-card-border);
    border-radius: 14px;
    padding: 40px 36px;
    position: relative;
    box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
  }

  .auth-form-card h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--auth-ink);
    margin: 0 0 6px;
    letter-spacing: -0.02em;
    font-family: 'Source Sans Pro', sans-serif !important;
  }

  .auth-form-card .auth-sub {
    font-size: 13.5px;
    color: var(--auth-muted);
    margin: 0 0 26px;
    line-height: 1.5;
    font-weight: 400;
    font-family: 'Source Sans Pro', sans-serif !important;
  }

  .auth-alert {
    background: var(--auth-danger-bg);
    border: 1px solid var(--auth-danger-border);
    color: var(--auth-danger);
    padding: 11px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 18px;
    font-family: 'Source Sans Pro', sans-serif !important;
  }

  .auth-alert-success {
    background: var(--auth-success-bg);
    border: 1px solid var(--auth-success-border);
    color: var(--auth-success);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .auth-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 7px;
    font-family: 'Source Sans Pro', sans-serif !important;
  }

  .auth-input-wrap {
    position: relative;
  }

  .auth-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748B;
    display: flex;
    pointer-events: none;
    transition: color 0.15s ease;
  }

  .auth-input, .auth-select {
    width: 100%;
    height: 44px;
    border: 1px solid var(--auth-input-border);
    background: var(--auth-input-bg);
    border-radius: 8px;
    padding: 0 14px 0 40px;
    font-size: 13.5px;
    font-family: 'Source Sans Pro', sans-serif !important;
    color: var(--auth-ink);
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .auth-input::placeholder { color: #94A3B8; font-family: 'Source Sans Pro', sans-serif; }

  .auth-input:focus, .auth-select:focus {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.12);
  }

  .auth-input:focus + .auth-input-icon {
    color: #059669;
  }

  .auth-input.auth-input-error {
    border-color: var(--auth-danger);
    background: #FFFDFD;
  }

  .auth-input[readonly] {
    background: #F8FAFC;
    color: var(--auth-muted);
    cursor: not-allowed;
  }

  .auth-select {
    appearance: none;
    cursor: pointer;
    padding-right: 38px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }

  .auth-field-error {
    font-size: 12px;
    color: var(--auth-danger);
    margin-top: 5px;
    font-weight: 600;
    font-family: 'Source Sans Pro', sans-serif !important;
  }

  .auth-caps {
    font-size: 12px;
    color: #B45309;
    margin-top: 5px;
    font-weight: 600;
    font-family: 'Source Sans Pro', sans-serif !important;
  }

  .auth-toggle-pw {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    color: #64748B;
    padding: 6px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Source Sans Pro', sans-serif;
  }
  .auth-toggle-pw:hover { color: #059669; }

  .auth-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin: 2px 0;
  }

  .auth-remember {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: #334155;
    cursor: pointer;
    font-weight: 500;
    font-family: 'Source Sans Pro', sans-serif;
  }

  .auth-remember input {
    width: 15px;
    height: 15px;
    accent-color: #059669;
    cursor: pointer;
    border-radius: 4px;
  }

  .auth-link {
    color: #059669;
    font-weight: 600;
    font-size: 12.5px;
    text-decoration: none;
    font-family: 'Source Sans Pro', sans-serif;
  }
  .auth-link:hover {
    color: #047857;
    text-decoration: underline;
  }

  .auth-submit {
    width: 100%;
    height: 44px;
    border: none;
    border-radius: 8px;
    background: #059669;
    color: #FFFFFF;
    font-family: 'Source Sans Pro', sans-serif !important;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0;
    padding: 0 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 4px;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .auth-submit:hover:not(:disabled) {
    background: #047857;
    transform: translateY(-1px);
  }
  .auth-submit:active:not(:disabled) {
    transform: translateY(0);
  }
  .auth-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; box-shadow: none; }

  .auth-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #FFFFFF;
    border-radius: 50%;
    animation: auth-spin 0.7s linear infinite;
  }
  @keyframes auth-spin { to { transform: rotate(360deg); } }

  .auth-help {
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: center;
    margin-top: 22px;
    font-size: 11.5px;
    color: #94A3B8;
    font-family: 'Source Sans Pro', sans-serif;
  }
  .auth-help::before,
  .auth-help::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #F1F5F9;
  }

  .auth-footer {
    text-align: center;
    margin-top: 16px;
    font-size: 13px;
    color: var(--auth-muted);
    font-family: 'Source Sans Pro', sans-serif;
  }

  .auth-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .auth-recaptcha {
    display: flex;
    justify-content: center;
    margin: 4px 0;
    transform: scale(0.96);
    transform-origin: center;
  }

  .auth-btn-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    background: #059669;
    color: #FFFFFF;
    font-family: 'Source Sans Pro', sans-serif;
    font-weight: 600;
    font-size: 13.5px;
    text-decoration: none;
    padding: 11px 24px;
    transition: background 0.15s ease;
    box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);
  }
  .auth-btn-link:hover { background: #047857; }

  @media (max-width: 960px) {
    .auth-shell { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .auth-right { padding: 32px 18px; min-height: 100vh; }
    .auth-form-card { padding: 34px 24px; }
    .auth-grid-2 { grid-template-columns: 1fr; }
  }
`

function FeatureIcon({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

export function FieldIcon({ path }: { path: string }) {
  return (
    <span className="auth-input-icon" aria-hidden="true">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </span>
  )
}

export function PasswordEyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export const AUTH_ICONS = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  role: 'M12 2 4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z',
}

interface AuthShellProps {
  children: ReactNode
}

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <style>{authShellCss}</style>

      <aside className="auth-left" aria-hidden={false}>
        <div className="auth-brand">
          <div className="auth-logo-house">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
              <path d="M9.5 21v-6h5v6" />
            </svg>
          </div>
          <div className="auth-brand-name">
            GoFreeHold
            <span className="auth-brand-sub">Real Estate Management</span>
          </div>
        </div>

        <div className="auth-hero-wrap">
          <h1>
            Property &amp; Lease
            <br />
            Management
          </h1>
          <p className="auth-left-support">
            Automated freehold property portfolios, UAE tenancy contracts, and payments platform.
          </p>

          <ul className="auth-features">
            {FEATURES.map((f) => (
              <li key={f.label}>
                <span className="auth-feature-icon">
                  <FeatureIcon path={f.icon} />
                </span>
                <span>{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth-right">
        <div className="auth-form-card">
          {children}
        </div>
      </main>
    </div>
  )
}
