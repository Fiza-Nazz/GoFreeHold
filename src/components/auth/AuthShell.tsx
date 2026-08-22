import type { ReactNode } from 'react'

/** Shared visual shell for Login / Register / Forgot / Reset — presentation only. */
const FEATURES = [
  {
    label: 'Property Portfolio Management',
    icon: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12',
  },
  {
    label: 'Tenant & Lease Management',
    icon: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  },
  {
    label: 'Maintenance & Repairs Tracking',
    icon: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  },
]

export const authShellCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    --auth-green-950: #052e2e;
    --auth-green-900: #0c3d3b;
    --auth-green-800: #10504c;
    --auth-green-700: #156b64;
    --auth-green-600: #1c8a80;
    --auth-green-100: #d7f0ec;
    --auth-green-50: #f0fbf9;
    --auth-ink: #0c3d3b;
    --auth-muted: #6b7280;
    --auth-line: #e5e7eb;
    --auth-input: #f3f4f6;
    --auth-white: #ffffff;
    --auth-danger: #b91c1c;
    --auth-success: #10504c;
  }

  * { box-sizing: border-box; }

  .auth-shell {
    min-height: 100vh;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    background: var(--auth-white);
    color: #111827;
  }

  .auth-left {
    background: var(--auth-green-900);
    color: var(--auth-white);
    padding: 48px 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .auth-left::after {
    content: '';
    position: absolute;
    inset: auto -20% -30% auto;
    width: 320px;
    height: 320px;
    border-radius: 0%;
    background: rgba(255,255,255,0.04);
    pointer-events: none;
  }

  .auth-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
  }

  .auth-logo {
    width: 42px;
    height: 42px;
    border-radius: 0;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.22);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 0.02em;
  }

  .auth-brand-name {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .auth-left h1 {
    font-size: clamp(28px, 3.2vw, 38px);
    font-weight: 800;
    line-height: 1.15;
    margin: 0 0 14px;
    max-width: 420px;
  }

  .auth-left-support {
    font-size: 15px;
    line-height: 1.55;
    color: rgba(255,255,255,0.78);
    margin: 0 0 36px;
    max-width: 400px;
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
    gap: 12px;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.92);
  }

  .auth-feature-icon {
    width: 36px;
    height: 36px;
    border-radius: 0;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.16);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #b7ece2;
  }

  .auth-right {
    background: var(--auth-white);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 28px;
  }

  .auth-form-card {
    width: 100%;
    max-width: 420px;
  }

  .auth-form-card h2 {
    font-size: 28px;
    font-weight: 800;
    color: #111827;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  .auth-form-card .auth-sub {
    font-size: 14px;
    color: var(--auth-muted);
    margin: 0 0 28px;
    line-height: 1.45;
  }

  .auth-alert {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: var(--auth-danger);
    padding: 12px 14px;
    border-radius: 0;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .auth-alert-success {
    background: var(--auth-green-50);
    border: 1px solid #a7e5da;
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
    color: #374151;
    margin-bottom: 7px;
  }

  .auth-input-wrap {
    position: relative;
  }

  .auth-input-icon {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    display: flex;
    pointer-events: none;
  }

  .auth-input, .auth-select {
    width: 100%;
    border: 1px solid var(--auth-line);
    background: var(--auth-input);
    border-radius: 0;
    padding: 13px 14px 13px 42px;
    font-size: 14px;
    font-family: inherit;
    color: #111827;
    outline: none;
    transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
  }

  .auth-input::placeholder { color: #9ca3af; }

  .auth-input:focus, .auth-select:focus {
    border-color: var(--auth-green-700);
    background: var(--auth-white);
    box-shadow: 0 0 0 3px rgba(21, 107, 100, 0.15);
  }

  .auth-input.auth-input-error {
    border-color: var(--auth-danger);
  }

  .auth-input[readonly] {
    background: #e5e7eb;
    color: var(--auth-muted);
    cursor: not-allowed;
  }

  .auth-select {
    appearance: none;
    cursor: pointer;
    padding-right: 36px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2310504c' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
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
    color: var(--auth-green-800);
    margin-top: 6px;
    font-weight: 600;
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
    padding: 4px;
  }
  .auth-toggle-pw:hover { color: var(--auth-green-700); }

  .auth-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .auth-remember {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--auth-muted);
    cursor: pointer;
  }

  .auth-remember input {
    width: 16px;
    height: 16px;
    accent-color: var(--auth-green-700);
    cursor: pointer;
  }

  .auth-link {
    color: var(--auth-green-700);
    font-weight: 700;
    font-size: 13px;
    text-decoration: none;
  }
  .auth-link:hover { text-decoration: underline; }

  .auth-submit {
    width: 100%;
    border: none;
    border-radius: 0;
    background: var(--auth-green-800);
    color: var(--auth-white);
    font-family: inherit;
    font-weight: 700;
    font-size: 14.5px;
    padding: 14px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 4px;
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .auth-submit:hover:not(:disabled) {
    background: var(--auth-green-700);
    transform: translateY(-1px);
  }
  .auth-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .auth-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 0%;
    animation: auth-spin 0.7s linear infinite;
  }
  @keyframes auth-spin { to { transform: rotate(360deg); } }

  .auth-help {
    text-align: center;
    margin-top: 18px;
    font-size: 12.5px;
    color: var(--auth-muted);
  }

  .auth-footer {
    text-align: center;
    margin-top: 22px;
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
    transform: scale(0.95);
    transform-origin: center;
  }

  .auth-btn-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 0;
    background: var(--auth-green-800);
    color: var(--auth-white);
    font-weight: 700;
    font-size: 14px;
    text-decoration: none;
    padding: 13px 22px;
  }
  .auth-btn-link:hover { background: var(--auth-green-700); }

  @media (max-width: 860px) {
    .auth-shell { grid-template-columns: 1fr; }
    .auth-left { display: none; }
    .auth-right { padding: 28px 18px; min-height: 100vh; }
    .auth-grid-2 { grid-template-columns: 1fr; }
  }
`

function FeatureIcon({ path }: { path: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
          <div className="auth-brand-name">GoFreeHold</div>
        </div>
        <h1>Property Management Made Simple</h1>
        <p className="auth-left-support">
          Run freehold portfolios, leases, payments, and maintenance from one secure platform built for Dubai property teams.
        </p>
        <ul className="auth-features">
          {FEATURES.map((f) => (
            <li key={f.label}>
              <span className="auth-feature-icon">
                <FeatureIcon path={f.icon} />
              </span>
              {f.label}
            </li>
          ))}
        </ul>
      </aside>

      <main className="auth-right">
        <div className="auth-form-card">
          {children}
        </div>
      </main>
    </div>
  )
}