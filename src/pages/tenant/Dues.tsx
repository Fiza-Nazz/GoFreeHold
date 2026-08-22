import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, ADMIN_COLORS, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

interface LedgerEntry {
  id: number
  date: string
  description?: string
  debit: number
  credit: number
}

export default function TenantDues() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [summary, setSummary] = useState<{ total_debit: number; total_credit: number; total_balance: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const res = await api.get('/tenant/finance/ledger')
        if (cancelled) return
        const data = res.data?.data || {}
        setEntries(data.entries || [])
        setSummary({
          total_debit: Number(data.total_debit ?? 0),
          total_credit: Number(data.total_credit ?? 0),
          total_balance: Number(data.total_balance ?? ((data.total_debit ?? 0) - (data.total_credit ?? 0))),
        })
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setEntries([])
          setSummary(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Rent &amp; DEWA Dues</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>My Dues</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Outstanding rent from the debit/credit ledger</div>
        </div>
      </div>

      {!isLoading && summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
          {[
            { label: 'Total debit', value: `AED ${summary.total_debit.toLocaleString()}`, bg: '#991b1b', sub: 'Debit' },
            { label: 'Total credit', value: `AED ${summary.total_credit.toLocaleString()}`, bg: '#065f46', sub: 'Credit' },
            { label: 'Balance', value: `AED ${summary.total_balance.toLocaleString()}`, bg: '#b45309', sub: 'Balance' },
          ].map((card, i) => (
            <div
              key={card.label}
              className="gfh-portal-stat"
              style={{
                background: card.bg,
                color: '#fff',
                borderRadius: 0,
                padding: '20px 18px',
                minHeight: 110,
                boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)',
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800 }}>{card.value}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>{card.label}</div>
              <div style={{
                display: 'inline-block',
                marginTop: 8,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.18)',
                padding: '3px 8px',
                borderRadius: 0,
              }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="fade-in" style={{ ...panelStyle, minHeight: 280 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No dues to display yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Date', 'Description', 'Debit (AED)', 'Credit (AED)'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(item => (
                  <tr key={item.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{formatDate(item.date)}</td>
                    <td style={tdStyle}>{item.description || 'Entry'}</td>
                    <td style={{ ...tdStyle, color: '#991b1b', fontWeight: 700 }}>{Number(item.debit || 0).toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#065f46', fontWeight: 700 }}>{Number(item.credit || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
