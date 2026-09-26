import { useEffect, useState, useMemo } from 'react'
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
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  receipt: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  info: 'M12 8h.01M12 12v4M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z',
}

export default function TenantDues() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [summary, setSummary] = useState<{ total_debit: number; total_credit: number; total_balance: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries
    const q = searchQuery.toLowerCase().trim()
    return entries.filter(e => {
      const matchDesc = (e.description || '').toLowerCase().includes(q)
      const matchDate = (e.date || '').toLowerCase().includes(q)
      const matchDebit = String(e.debit).includes(q)
      const matchCredit = String(e.credit).includes(q)
      return matchDesc || matchDate || matchDebit || matchCredit
    })
  }, [entries, searchQuery])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: THEME.pageBg, minHeight: '100%' }}>
      <style>{portalPageCss}</style>

      {/* Hero Header */}
      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#0F8A67', marginBottom: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Financial Statement
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.ink, letterSpacing: '-0.02em', marginTop: 2 }}>
            Rent &amp; DEWA Ledger
          </div>
          <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
            Detailed breakdown of debits, charges, rental credits, and current outstanding balance
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {!isLoading && summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
          {[
            {
              label: 'Total Debit (Charges)',
              value: `AED ${summary.total_debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: icons.debit,
              iconBg: '#FEF2F2',
              iconColor: '#DC2626',
              badgeBg: '#FEF2F2',
              badgeColor: '#991B1B',
              badgeBorder: '#FECACA',
              sub: 'Total Invoiced',
            },
            {
              label: 'Total Credit (Paid)',
              value: `AED ${summary.total_credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: icons.credit,
              iconBg: '#F0FDF4',
              iconColor: '#0F8A67',
              badgeBg: '#F0FDF4',
              badgeColor: '#065F46',
              badgeBorder: '#BBF7D0',
              sub: 'Settled',
            },
            {
              label: 'Balance Due',
              value: `AED ${summary.total_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: icons.balance,
              iconBg: summary.total_balance > 0 ? '#FFFBEB' : '#ECFDF8',
              iconColor: summary.total_balance > 0 ? '#D97706' : '#0E5E48',
              badgeBg: summary.total_balance > 0 ? '#FFFBEB' : '#ECFDF8',
              badgeColor: summary.total_balance > 0 ? '#B45309' : '#065F46',
              badgeBorder: summary.total_balance > 0 ? '#FDE68A' : '#A7F3DC',
              sub: summary.total_balance > 0 ? 'Payable Now' : 'Fully Cleared',
            },
          ].map((card, i) => (
            <div
              key={card.label}
              className="gfh-portal-stat"
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '20px 22px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 128,
                animationDelay: `${i * 0.06}s`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: card.iconBg,
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={card.icon} size={22} />
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
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
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

      {/* Helpful Info Notice */}
      <div
        className="fade-in"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          background: '#ECFDF8',
          border: '1px solid #A7F3DC',
          borderRadius: 12,
          color: '#065F46',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 20,
        }}
      >
        <Icon path={icons.info} size={18} />
        <div>
          Rent instalments are posted automatically according to your tenancy contract schedule. Cheque clearance updates reflect upon bank settlement.
        </div>
      </div>

      {/* Main Ledger Table Panel */}
      <div className="fade-in" style={{ ...panelStyle, minHeight: 280, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: THEME.ink, margin: 0 }}>
              Transaction History
            </h3>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              {entries.length} recorded ledger movements
            </div>
          </div>

          {/* Quick Search */}
          {entries.length > 0 && (
            <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                <Icon path={icons.search} size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ledger entries..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: 12.5,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : filteredEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F8FAFC', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon path={icons.receipt} size={22} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: THEME.ink, margin: 0 }}>
              {searchQuery ? 'No transactions match your search.' : 'No ledger transactions recorded yet.'}
            </p>
            <p style={{ fontSize: 12.5, color: THEME.textMuted, marginTop: 4 }}>
              As charges and payments are processed, line items will appear here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Description &amp; Purpose</th>
                  <th style={thStyle}>Type</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Debit (Charge)</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Credit (Paid)</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(e => {
                  const isDebit = Number(e.debit) > 0
                  return (
                    <tr key={e.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontSize: 12.5, color: '#334155', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {formatDate(e.date)}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: THEME.ink }}>
                        {e.description || 'Transaction entry'}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: isDebit ? '#FEF2F2' : '#ECFDF8',
                            color: isDebit ? '#991B1B' : '#065F46',
                            border: `1px solid ${isDebit ? '#FECACA' : '#A7F3DC'}`,
                          }}
                        >
                          {isDebit ? 'Charge' : 'Payment'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: isDebit ? '#DC2626' : '#94A3B8' }}>
                        {isDebit ? `AED ${Number(e.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: !isDebit && Number(e.credit) > 0 ? '#059669' : '#94A3B8' }}>
                        {!isDebit && Number(e.credit) > 0 ? `AED ${Number(e.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
