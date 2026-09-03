import type { ReactNode } from 'react'
import { CornerBrackets } from '../gfh/adminTheme'

/** Shared visual shell for Login / Register / Forgot / Reset — presentation only. */
const FEATURES = [
  {
    label: 'Freehold Portfolio & Unit Management',
    sub: 'Real-time drilldown into buildings, floors, and occupancy',
    icon: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12',
  },
  {
    label: 'UAE RERA-Compliant Tenancy & PDC Cheques',
    sub: 'Automated contract lifecycles, addendums, and banking tracking',
    icon: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  },
  {
    label: 'Automated Rent Ledgers & Watchdog Alerts',
    sub: 'Scheduled 100-day contract expiry, dues, and vacant alerts',
    icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  },
  {
    label: 'Maintenance, Work Orders & Move-out Settlements',
    sub: 'Rapid technician dispatch, store room inventory, and clearance audits',
    icon: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  },
]

export const authShellCss = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

  :root {
    --auth-purple-deep: #18002E;
    --auth-purple-mid: #240046;
    --auth-purple-light: #3C096C;
    --auth-purple-accent: #5A189A;
    --auth-purple-glow: rgba(90, 24, 154, 0.4);
    --auth-canvas: #F8F7FD;
    --auth-card-border: #E2E8F0;
    --auth-card-bg: #FFFFFF;
    --auth-ink: #18002E;
    --auth-muted: #64748B;
    --auth-line: #E2E8F0;
    --auth-input-bg: #FFFFFF;
    --auth-input-border: #CBD5E1;
    --auth-danger: #991B1B;
    --auth-danger-bg: #FEF2F2;
    --auth-danger-border: #FECACA;
    --auth-success: #065F46;
    --auth-success-bg: #F0FDF4;
    --auth-success-border: #BBF7D0;
  }

  * { box-sizing: border-box; }

  .auth-shell {
    min-height: 100vh;
    width: 100%;
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    font-family: 'Poppins', system-ui, -apple-system, sans-serif;
    background: var(--auth-canvas);
    color: var(--auth-ink);
  }

  /* ── LEFT SHOWCASE PANEL (DEEP MIDNIGHT PURPLE) ── */
  .auth-left {
    background: linear-gradient(155deg, #100020 0%, #18002E 38%, #240046 75%, #3C096C 100%);
    color: #FFFFFF;
    padding: 60px 56px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  .auth-left::before {
    content: '';
    position: absolute;
    top: -15%;
    right: -15%;
    width: 440px;
    height: 440px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(90, 24, 154, 0.35) 0%, rgba(36, 0, 70, 0) 70%);
    pointer-events: none;
    z-index: 0;
  }

  .auth-left::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -15%;
    width: 380px;
    height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(60, 9, 108, 0.3) 0%, rgba(24, 0, 46, 0) 70%);
    pointer-events: none;
    z-index: 0;
  }

  .auth-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    position: relative;
    z-index: 1;
  }

  .auth-logo {
    width: 44px;
    height: 44px;
    border-radius: 0;
    background: #18002E;
    border: 1.5px solid #5A189A;
    box-shadow: 0 0 14px rgba(90, 24, 154, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0.05em;
  }

  .auth-brand-name {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: #FFFFFF;
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .auth-brand-sub {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #C77DFF;
    margin-top: 4px;
  }

  .auth-hero-wrap {
    margin: 40px 0;
    position: relative;
    z-index: 1;
  }

  .auth-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(90, 24, 154, 0.25);
    border: 1px solid rgba(199, 125, 255, 0.35);
    color: #E0AAFF;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 0;
    margin-bottom: 20px;
  }

  .auth-badge-dot {
    width: 6px;
    height: 6px;
    background: #10B981;
    border-radius: 50%;
    box-shadow: 0 0 6px #10B981;
  }

  .auth-left h1 {
    font-size: clamp(30px, 3.2vw, 42px);
    font-weight: 800;
    line-height: 1.2;
    margin: 0 0 16px;
    color: #FFFFFF;
    letter-spacing: -0.02em;
  }

  .auth-left-support {
    font-size: 15px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.82);
    margin: 0 0 36px;
    max-width: 480px;
    font-weight: 400;
  }

  .auth-features {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .auth-features li {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .auth-feature-icon {
    width: 40px;
    height: 40px;
    border-radius: 0;
    background: rgba(60, 9, 108, 0.45);
    border: 1px solid rgba(199, 125, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #C77DFF;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .auth-feature-text {
    display: flex;
    flex-direction: column;
  }

  .auth-feature-title {
    font-size: 14.5px;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: -0.01em;
  }

  .auth-feature-desc {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.65);
    margin-top: 3px;
    line-height: 1.4;
  }

  .auth-trust-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.55);
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1;
  }

  /* ── RIGHT FORM PANEL (LUXURY CANVAS) ── */
  .auth-right {
    background: var(--auth-canvas);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 36px;
    position: relative;
  }

  .auth-form-card {
    width: 100%;
    max-width: 480px;
    background: var(--auth-card-bg);
    border: 1px solid var(--auth-card-border);
    border-radius: 0;
    padding: 44px 40px;
    position: relative;
    box-shadow: 0 20px 45px -10px rgba(24, 0, 46, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03);
  }

  .auth-form-card h2 {
    font-size: 28px;
    font-weight: 800;
    color: var(--auth-ink);
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .auth-form-card .auth-sub {
    font-size: 14px;
    color: var(--auth-muted);
    margin: 0 0 28px;
    line-height: 1.5;
    font-weight: 500;
  }

  .auth-alert {
    background: var(--auth-danger-bg);
    border: 1px solid var(--auth-danger-border);
    color: var(--auth-danger);
    padding: 13px 16px;
    border-radius: 0;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .auth-alert-success {
    background: var(--auth-success-bg);
    border: 1px solid var(--auth-success-border);
    color: var(--auth-success);
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .auth-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--auth-purple-mid);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 7px;
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
    height: 48px;
    border: 1px solid var(--auth-input-border);
    background: var(--auth-input-bg);
    border-radius: 0;
    padding: 0 14px 0 44px;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    color: var(--auth-ink);
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .auth-input::placeholder { color: #94A3B8; font-weight: 400; }

  .auth-input:focus, .auth-select:focus {
    border-color: var(--auth-purple-mid);
    box-shadow: 0 0 0 3px rgba(36, 0, 70, 0.12);
  }

  .auth-input:focus + .auth-input-icon {
    color: var(--auth-purple-mid);
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
    padding-right: 40px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23240046' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
  }

  .auth-field-error {
    font-size: 12px;
    color: var(--auth-danger);
    margin-top: 6px;
    font-weight: 600;
  }

  .auth-caps {
    font-size: 12px;
    color: #B45309;
    margin-top: 6px;
    font-weight: 600;
  }

  .auth-toggle-pw {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    color: var(--auth-muted);
    padding: 6px 8px;
    border-radius: 0;
    transition: color 0.15s ease;
  }
  .auth-toggle-pw:hover { color: var(--auth-purple-mid); }

  .auth-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin: 2px 0 6px;
  }

  .auth-remember {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--auth-muted);
    cursor: pointer;
    font-weight: 500;
  }

  .auth-remember input {
    width: 16px;
    height: 16px;
    accent-color: var(--auth-purple-mid);
    cursor: pointer;
    border-radius: 0;
  }

  .auth-link {
    color: var(--auth-purple-mid);
    font-weight: 700;
    font-size: 13px;
    text-decoration: none;
    transition: color 0.15s ease;
  }
  .auth-link:hover {
    color: var(--auth-purple-accent);
    text-decoration: underline;
  }

  .auth-submit {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 0;
    background: linear-gradient(135deg, #18002E 0%, #240046 100%);
    color: #FFFFFF;
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 8px;
    box-shadow: 0 4px 14px rgba(24, 0, 46, 0.25);
    transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  }
  .auth-submit:hover:not(:disabled) {
    background: linear-gradient(135deg, #240046 0%, #3C096C 100%);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(36, 0, 70, 0.35);
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
    margin-top: 22px;
    font-size: 12.5px;
    color: var(--auth-muted);
  }

  .auth-footer {
    text-align: center;
    margin-top: 14px;
    font-size: 13.5px;
    color: var(--auth-muted);
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
    border-radius: 0;
    background: linear-gradient(135deg, #18002E 0%, #240046 100%);
    color: #FFFFFF;
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 13.5px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 13px 24px;
    box-shadow: 0 4px 14px rgba(24, 0, 46, 0.25);
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .auth-btn-link:hover {
    background: linear-gradient(135deg, #240046 0%, #3C096C 100%);
    transform: translateY(-1px);
  }

  @media (max-width: 960px) {
    .auth-shell { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .auth-right { padding: 36px 20px; min-height: 100vh; }
    .auth-form-card { padding: 36px 24px; }
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
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="auth-badge">
            <span className="auth-badge-dot" />
            Dubai Enterprise Property Cloud
          </div>

          <h1>Next-Generation Freehold Ecosystem</h1>
          <p className="auth-left-support">
            Comprehensive property management platform built for UAE landlords, property owners, and tenants. Seamlessly handle leasing, receivables, and maintenance.
          </p>

          <ul className="auth-features">
            {FEATURES.map((f) => (
              <li key={f.label}>
                <span className="auth-feature-icon">
                  <FeatureIcon path={f.icon} />
                </span>
                <div className="auth-feature-text">
                  <span className="auth-feature-title">{f.label}</span>
                  <span className="auth-feature-desc">{f.sub}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-trust-footer">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C77DFF" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>256-Bit SSL Encrypted • RERA & Dubai Real Estate Compliant</span>
        </div>
      </aside>

      <main className="auth-right">
        <div className="auth-form-card">
          <CornerBrackets color="#240046" />
          {children}
        </div>
      </main>
    </div>
  )
}
