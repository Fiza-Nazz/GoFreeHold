import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

interface LedgerEntry {
  id: number
  date: string
  description?: string
  debit: number
  credit: number
}

const icons = {
  debit: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z',
  credit: 'M12 5v14M5 12h14',
  balance: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
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
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Rent &amp; DEWA Dues</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>My Dues</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Outstanding rent from the debit/credit ledger</div>
        </div>
      </div>

      {!isLoading && summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
          {[
            {
              label: 'Total Debit',
              value: `AED ${summary.total_debit.toLocaleString()}`,
              icon: icons.debit,
              iconBg: '#FEF2F2',
              iconColor: '#DC2626',
              badgeBg: '#FEF2F2',
              badgeColor: '#991B1B',
              badgeBorder: '#FECACA',
              sub: 'Debit',
            },
            {
              label: 'Total Credit',
              value: `AED ${summary.total_credit.toLocaleString()}`,
              icon: icons.credit,
              iconBg: '#F0FDF4',
              iconColor: '#0F8A67',
              badgeBg: '#F0FDF4',
              badgeColor: '#065F46',
              badgeBorder: '#BBF7D0',
              sub: 'Credit',
            },
            {
              label: 'Balance Due',
              value: `AED ${summary.total_balance.toLocaleString()}`,
              icon: icons.balance,
              iconBg: '#FFFBEB',
              iconColor: '#D97706',
              badgeBg: '#FFFBEB',
              badgeColor: '#B45309',
              badgeBorder: '#FDE68A',
              sub: 'Balance',
            },
          ].map((card, i) => (
            <div
              key={card.label}
              className="gfh-portal-stat"
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '20px 22px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 124,
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: card.iconBg,
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={card.icon} size={20} />
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  background: card.badgeBg,
                  color: card.badgeColor,
                  border: `1px solid ${card.badgeBorder}`,
                  padding: '3px 9px',
                  borderRadius: 999,
                }}>
                  {card.sub}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                  {card.label}
                </div>
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
