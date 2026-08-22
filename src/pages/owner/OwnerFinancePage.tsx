import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, ADMIN_COLORS, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle, RADIUS } from '../../components/gfh/adminTheme'
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

const gfhRef = (id: number) => `GFH-${String(id).padStart(5, '0')}`
const aed = (v: unknown) => `AED ${Number(v ?? 0).toLocaleString()}`

function StatCard({ label, value, bg, sub }: { label: string; value: string; bg: string; sub: string }) {
  return (
    <div className="gfh-portal-stat" style={{ flex: '1 1 200px', padding: '20px 18px', background: bg, color: '#fff', borderRadius: 0, minHeight: 110, boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)' }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>{label}</div>
      <div style={{ display: 'inline-block', marginTop: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.18)', padding: '3px 8px', borderRadius: 0 }}>{sub}</div>
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
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, margin: 0 }}>{meta.title}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>{meta.subtitle}</div>
        </div>
        <Link to="/owner/dashboard" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#075985' }}>
          ← Back to dashboard
        </Link>
      </div>

      {!isLoading && !error && data && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
          {kind === 'ledger' && (
            <>
              <StatCard label="Total debit (due)" value={aed(data.total_debit)} bg="#991b1b" sub="Debit" />
              <StatCard label="Total credit (paid)" value={aed(data.total_credit)} bg="#065f46" sub="Credit" />
              <StatCard label="Outstanding balance" value={aed(Number(data.total_debit ?? 0) - Number(data.total_credit ?? 0))} bg="#b45309" sub="Balance" />
            </>
          )}
          {kind === 'receivables' && (
            <StatCard label="Total outstanding" value={aed(data.total_outstanding)} bg="#991b1b" sub="Due" />
          )}
          {kind === 'payments' && (
            <StatCard label="Total received" value={aed(data.total_amount)} bg="#065f46" sub="Paid" />
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
                          <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 0, background: c.status === 'active' ? '#f0fdf4' : '#f3f4f6', color: c.status === 'active' ? '#065f46' : '#374151', border: `1px solid ${c.status === 'active' ? '#bbf7d0' : '#d1d5db'}` }}>
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
