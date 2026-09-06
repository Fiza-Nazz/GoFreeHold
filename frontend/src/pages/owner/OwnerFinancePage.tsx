import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle, RADIUS } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

type FinanceKind = 'ledger' | 'receivables' | 'payments'

const copy: Record<FinanceKind, { title: string; subtitle: string }> = {
  ledger: {
    title: 'Rent Ledger',
    subtitle: 'Debit / credit history across your contracts',
  },
  receivables: {
    title: 'Receivables',
    subtitle: 'Outstanding balances per contract in your portfolio',
  },
  payments: {
    title: 'Payments',
    subtitle: 'Payment history recorded against your contracts',
  },
}

const icons = {
  debit: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z',
  credit: 'M12 5v14M5 12h14',
  balance: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
}

const gfhRef = (id: number) => `GFH-${String(id).padStart(5, '0')}`
const aed = (v: unknown) => `AED ${Number(v ?? 0).toLocaleString()}`

function StatCard({ label, value, sub, icon, iconBg, iconColor, badgeBg, badgeColor, badgeBorder }: {
  label: string
  value: string
  sub: string
  icon: string
  iconBg: string
  iconColor: string
  badgeBg: string
  badgeColor: string
  badgeBorder: string
}) {
  return (
    <div
      className="gfh-portal-stat"
      style={{
        flex: '1 1 220px',
        background: '#FFFFFF',
        borderRadius: 14,
        padding: '20px 22px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 124,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon path={icon} size={20} />
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
          background: badgeBg,
          color: badgeColor,
          border: `1px solid ${badgeBorder}`,
          padding: '3px 9px',
          borderRadius: 999,
        }}>
          {sub}
        </span>
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
          {value}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
          {label}
        </div>
      </div>
    </div>
  )
}

export default function OwnerFinancePage({ kind }: { kind: FinanceKind }) {
  const meta = copy[kind]
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError('')
    setData(null)
    api
      .get(`/owner/finance/${kind}`)
      .then(res => { if (!cancelled) setData(res.data?.data || null) })
      .catch(() => { if (!cancelled) setError('Could not load data. Please try again.') })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [kind])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, margin: 0 }}>{meta.title}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{meta.subtitle}</div>
        </div>
        <Link to="/owner/dashboard" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#0E5E48', borderRadius: 8 }}>
          ← Back to dashboard
        </Link>
      </div>

      {!isLoading && !error && data && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
          {kind === 'ledger' && (
            <>
              <StatCard
                label="Total debit (due)"
                value={aed(data.total_debit)}
                sub="Debit"
                icon={icons.debit}
                iconBg="#FEF2F2"
                iconColor="#DC2626"
                badgeBg="#FEF2F2"
                badgeColor="#991B1B"
                badgeBorder="#FECACA"
              />
              <StatCard
                label="Total credit (paid)"
                value={aed(data.total_credit)}
                sub="Credit"
                icon={icons.credit}
                iconBg="#F0FDF4"
                iconColor="#0F8A67"
                badgeBg="#F0FDF4"
                badgeColor="#065F46"
                badgeBorder="#BBF7D0"
              />
              <StatCard
                label="Outstanding balance"
                value={aed(Number(data.total_debit ?? 0) - Number(data.total_credit ?? 0))}
                sub="Balance"
                icon={icons.balance}
                iconBg="#FFFBEB"
                iconColor="#D97706"
                badgeBg="#FFFBEB"
                badgeColor="#B45309"
                badgeBorder="#FDE68A"
              />
            </>
          )}
          {kind === 'receivables' && (
            <StatCard
              label="Total outstanding"
              value={aed(data.total_outstanding)}
              sub="Due"
              icon={icons.balance}
              iconBg="#FEF2F2"
              iconColor="#DC2626"
              badgeBg="#FEF2F2"
              badgeColor="#991B1B"
              badgeBorder="#FECACA"
            />
          )}
          {kind === 'payments' && (
            <StatCard
              label="Total received"
              value={aed(data.total_amount)}
              sub="Paid"
              icon={icons.credit}
              iconBg="#F0FDF4"
              iconColor="#0F8A67"
              badgeBg="#F0FDF4"
              badgeColor="#065F46"
              badgeBorder="#BBF7D0"
            />
          )}
        </div>
      )}

      <div className="fade-in" style={{ ...panelStyle, minHeight: 220 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : error ? (
          <p style={{ fontSize: 14, color: '#991b1b', fontWeight: 600, textAlign: 'center', padding: 30 }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {kind === 'ledger' && (
              (data?.entries?.length ?? 0) === 0 ? (
                <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500, textAlign: 'center', padding: 30 }}>No ledger entries yet for your contracts.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                      {['Contract', 'Unit / property', 'Tenant', 'Date', 'Description', 'Debit (AED)', 'Credit (AED)'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.entries.map((e: any) => (
                      <tr key={e.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{gfhRef(e.contract_id)}</td>
                        <td style={tdStyle}>{e.contract?.unit?.number} ({e.contract?.unit?.property?.name})</td>
                        <td style={tdStyle}>{e.contract?.tenant?.name || '—'}</td>
                        <td style={tdStyle}>{formatDate(e.date)}</td>
                        <td style={tdStyle}>{e.description || '—'}</td>
                        <td style={{ ...tdStyle, color: '#991b1b', fontWeight: 700 }}>{Number(e.debit).toLocaleString()}</td>
                        <td style={{ ...tdStyle, color: '#065f46', fontWeight: 700 }}>{Number(e.credit).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {kind === 'receivables' && (
              (data?.contracts?.length ?? 0) === 0 ? (
                <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500, textAlign: 'center', padding: 30 }}>No contracts found in your portfolio.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                      {['Contract', 'Unit / property', 'Tenant', 'Status', 'Due (AED)', 'Paid (AED)', 'Balance (AED)'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.contracts.map((c: any) => (
                      <tr key={c.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{gfhRef(c.id)}</td>
                        <td style={tdStyle}>{c.unit?.number} ({c.unit?.property?.name})</td>
                        <td style={tdStyle}>{c.tenant?.name || '—'}</td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 999, display: 'inline-block', background: c.status === 'active' ? '#f0fdf4' : '#f3f4f6', color: c.status === 'active' ? '#065f46' : '#374151', border: `1px solid ${c.status === 'active' ? '#bbf7d0' : '#d1d5db'}` }}>
                            {safeUpper(c.status)}
                          </span>
                        </td>
                        <td style={tdStyle}>{Number(c.total_debit ?? 0).toLocaleString()}</td>
                        <td style={tdStyle}>{Number(c.total_credit ?? 0).toLocaleString()}</td>
                        <td style={{ ...tdStyle, color: c.balance > 0 ? '#991b1b' : '#065f46', fontWeight: 700 }}>{Number(c.balance ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {kind === 'payments' && (
              (data?.payments?.length ?? 0) === 0 ? (
                <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500, textAlign: 'center', padding: 30 }}>No payments recorded against your contracts yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                      {['Contract', 'Unit / property', 'Tenant', 'Type', 'Mode', 'Amount (AED)', 'Date'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.payments.map((p: any) => (
                      <tr key={p.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{gfhRef(p.contract_id)}</td>
                        <td style={tdStyle}>{p.contract?.unit?.number} ({p.contract?.unit?.property?.name})</td>
                        <td style={tdStyle}>{p.tenant?.name || '—'}</td>
                        <td style={{ ...tdStyle, textTransform: 'uppercase', fontSize: 12.5, fontWeight: 700, color: '#075985' }}>{String(p.type || '').replace('_', ' ')}</td>
                        <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{String(p.mode || '').replace('_', ' ')}</td>
                        <td style={{ ...tdStyle, color: '#065f46', fontWeight: 700 }}>{Number(p.amount).toLocaleString()}</td>
                        <td style={tdStyle}>{formatDate(p.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
