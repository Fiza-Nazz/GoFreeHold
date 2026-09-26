import type { ReactNode } from 'react'
import { CornerBrackets } from '../gfh/adminTheme'

/** Shared visual shell for Login / Register / Forgot / Reset — presentation only. */
const FEATURES = [
  {
    label: 'Portfolio & Unit Drill-down',
    icon: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12',
  },
  {
    label: 'UAE Tenancy Contracts & PDC Cheques',
    icon: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  },
  {
    label: 'Automated Ledgers & Maintenance',
    icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  },
]

export const authShellCss = `
  :root {
    --auth-brand-deep: #059669;
    --auth-brand-dark: #047857;
    --auth-brand-mid: #10B981;
    --auth-brand-light: #34D399;
    --auth-brand-accent: #10B981;
    --auth-canvas: #F6F8FA;
    --auth-card-border: #E2E8F0;
    --auth-card-bg: #FFFFFF;
    --auth-ink: #0F172A;
    --auth-muted: #64748B;
    --auth-line: #E2E8F0;
    --auth-input-bg: #FFFFFF;
    --auth-input-border: #CBD5E1;
    --auth-danger: #DC2626;
    --auth-danger-bg: #FEF2F2;
    --auth-danger-border: #FECACA;
    --auth-success: #059669;
    --auth-success-bg: #ECFDF5;
    --auth-success-border: #A7F3D0;
  }

  * {
    box-sizing: border-box;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  .auth-shell {
    min-height: 100vh;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--auth-canvas);
    color: var(--auth-ink);
  }

  /* ── LEFT PANEL (FRESH LIGHT GREEN / SOFT EMERALD HERO PANEL) ── */
  .auth-left {
    background: linear-gradient(145deg, #D1FAE5 0%, #ECFDF5 50%, #A7F3D0 100%);
    color: #064E3B;
    padding: 64px 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    border-right: 1px solid #A7F3D0;
  }

  .auth-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .auth-logo {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: #10B981;
    border: 1px solid #059669;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0.05em;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .auth-brand-name {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: #065F46;
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }

  .auth-brand-sub {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #059669;
    margin-top: 3px;
  }

  .auth-hero-wrap {
    margin: auto 0;
    padding: 30px 0;
  }

  .auth-left h1 {
    font-size: 36px;
    font-weight: 800;
    line-height: 1.25;
    margin: 0 0 14px;
    color: #064E3B;
    letter-spacing: -0.02em;
  }

  .auth-left-support {
    font-size: 15px;
    line-height: 1.6;
    color: #065F46;
    margin: 0 0 32px;
    max-width: 440px;
    font-weight: 500;
  }

  .auth-features {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .auth-features li {
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 14.5px;
    font-weight: 700;
    color: #064E3B;
  }

  .auth-feature-icon {
    width: 38px;
    height: 38px;
    border-radius: 9px;
    background: #FFFFFF;
    border: 1px solid #6EE7B7;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #10B981;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.14);
  }

  .auth-trust-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: #065F46;
    padding-top: 20px;
    border-top: 1px solid rgba(16, 185, 129, 0.28);
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
    max-width: 460px;
    background: var(--auth-card-bg);
    border: 1px solid var(--auth-card-border);
    border-radius: 14px;
    padding: 42px 38px;
    position: relative;
    box-shadow: 0 16px 36px -8px rgba(15, 23, 42, 0.07);
  }

  .auth-form-card h2 {
    font-size: 26px;
    font-weight: 800;
    color: var(--auth-ink);
    margin: 0 0 6px;
    letter-spacing: -0.02em;
    font-family: 'Inter', sans-serif !important;
  }

  .auth-form-card .auth-sub {
    font-size: 13.5px;
    color: var(--auth-muted);
    margin: 0 0 24px;
    line-height: 1.5;
    font-weight: 500;
    font-family: 'Inter', sans-serif !important;
  }

  .auth-alert {
    background: var(--auth-danger-bg);
    border: 1px solid var(--auth-danger-border);
    color: var(--auth-danger);
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 18px;
    font-family: 'Inter', sans-serif !important;
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
    font-size: 12px;
    font-weight: 700;
    color: #334155;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
    font-family: 'Inter', sans-serif !important;
  }

  .auth-input-wrap {
    position: relative;
  }

  .auth-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--auth-muted);
    display: flex;
    pointer-events: none;
    transition: color 0.15s ease;
  }

  .auth-input, .auth-select {
    width: 100%;
    height: 46px;
    border: 1px solid var(--auth-input-border);
    background: var(--auth-input-bg);
    border-radius: 8px;
    padding: 0 14px 0 44px;
    font-size: 14px;
    font-family: 'Inter', sans-serif !important;
    color: var(--auth-ink);
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .auth-input::placeholder { color: #94A3B8; font-family: 'Inter', sans-serif; }

  .auth-input:focus, .auth-select:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }

  .auth-input:focus + .auth-input-icon {
    color: #10B981;
  }

  .auth-input.auth-input-error {
    border-color: var(--auth-danger);
    background: #FFFDFD;
  }

  .auth-input[readonly] {
    background: #F1F5F9;
    color: var(--auth-muted);
    cursor: not-allowed;
  }

  .auth-select {
    appearance: none;
    cursor: pointer;
    padding-right: 38px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }

  .auth-field-error {
    font-size: 12px;
    color: var(--auth-danger);
    margin-top: 5px;
    font-weight: 600;
    font-family: 'Inter', sans-serif !important;
  }

  .auth-caps {
    font-size: 12px;
    color: #B45309;
    margin-top: 5px;
    font-weight: 600;
    font-family: 'Inter', sans-serif !important;
  }

  .auth-toggle-pw {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    color: var(--auth-muted);
    padding: 6px 8px;
    border-radius: 6px;
    font-family: 'Inter', sans-serif;
  }
  .auth-toggle-pw:hover { color: #10B981; }

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
    font-size: 13px;
    color: var(--auth-muted);
    cursor: pointer;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
  }

  .auth-remember input {
    width: 16px;
    height: 16px;
    accent-color: #10B981;
    cursor: pointer;
    border-radius: 4px;
  }

  .auth-link {
    color: #10B981;
    font-weight: 700;
    font-size: 13px;
    text-decoration: none;
    font-family: 'Inter', sans-serif;
  }
  .auth-link:hover {
    color: #059669;
    text-decoration: underline;
  }

  .auth-submit {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 10px;
    background: #10B981;
    color: #FFFFFF;
    font-family: 'Inter', sans-serif !important;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 0 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 6px;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .auth-submit:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.32);
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
    text-align: center;
    margin-top: 20px;
    font-size: 12.5px;
    color: var(--auth-muted);
    font-family: 'Inter', sans-serif;
  }

  .auth-footer {
    text-align: center;
    margin-top: 14px;
    font-size: 13.5px;
    color: var(--auth-muted);
    font-family: 'Inter', sans-serif;
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
    border-radius: 10px;
    background: #10B981;
    color: #FFFFFF;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    font-size: 13.5px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 12px 24px;
    transition: background 0.15s ease;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
  }
  .auth-btn-link:hover { background: #059669; }

  @media (max-width: 960px) {
    .auth-shell { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .auth-right { padding: 32px 18px; min-height: 100vh; }
    .auth-form-card { padding: 34px 22px; }
    .auth-grid-2 { grid-template-columns: 1fr; }
  }
`

function FeatureIcon({ path }: { path: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

export function FieldIcon({ path }: { path: string }) {
  return (
    <span className="auth-input-icon" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </span>
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
          <div className="auth-logo">GF</div>
          <div className="auth-brand-name">
            GoFreeHold
            <span className="auth-brand-sub">Real Estate Management</span>
          </div>
        </div>

        <div className="auth-hero-wrap">
          <h1>Property & Lease Management</h1>
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

        <div className="auth-trust-footer">
          <span>GoFreeHold • Dubai Real Estate Platform</span>
        </div>
      </aside>

      <main className="auth-right">
        <div className="auth-form-card">
          <CornerBrackets color="#10B981" />
          {children}
        </div>
      </main>
    </div>
  )
}
