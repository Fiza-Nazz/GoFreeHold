import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

interface TenantPayment {
  id: number
  amount: number | string
  type?: string
  mode?: string
  date?: string
  payment_date?: string
  reference_number?: string | null
  remarks?: string | null
  contract?: {
    unit?: { number?: string; property?: { name?: string } }
  }
}

const icons = {
  receipt: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  card: 'M12 5v14M5 12h14',
  check: 'M20 6 9 17l-5-5',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1',
}

export default function TenantPayments() {
  const [payments, setPayments] = useState<TenantPayment[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get('/tenant/finance/payments')
        if (cancelled) return
        const data = res.data?.data || {}
        setPayments(data.payments || [])
        setTotalAmount(Number(data.total_amount ?? 0))
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setPayments([])
          setError('Could not load payment history.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments
    const q = searchQuery.toLowerCase().trim()
    return payments.filter(p => {
      const matchRef = (p.reference_number || '').toLowerCase().includes(q)
      const matchId = String(p.id).includes(q)
      const matchProp = (p.contract?.unit?.property?.name || '').toLowerCase().includes(q)
      const matchUnit = (p.contract?.unit?.number || '').toLowerCase().includes(q)
      const matchType = (p.type || '').toLowerCase().includes(q)
      const matchMode = (p.mode || '').toLowerCase().includes(q)
      return matchRef || matchId || matchProp || matchUnit || matchType || matchMode
    })
  }, [payments, searchQuery])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: THEME.pageBg, minHeight: '100%' }}>
      <style>{portalPageCss}</style>

      {/* Hero Header */}
      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#0F8A67', marginBottom: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Payment Records
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.ink, letterSpacing: '-0.02em', marginTop: 2 }}>
            Past Payments &amp; Receipts
          </div>
          <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
            Official records of rent payments, wire transfers, and settled cheques
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {!isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
          {/* Total Paid */}
          <div
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
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#F0FDF4',
                color: '#0F8A67',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon path={icons.card} size={22} />
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                background: '#F0FDF4',
                color: '#065F46',
                border: '1px solid #BBF7D0',
                padding: '3px 9px',
                borderRadius: 999,
              }}>
                AED
              </span>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                AED {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                Total amount settled
              </div>
            </div>
          </div>

          {/* Total Payments Count */}
          <div
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
              animationDelay: '0.06s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#ECFDF8',
                color: '#0E5E48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon path={icons.receipt} size={22} />
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                background: '#ECFDF8',
                color: '#065F46',
                border: '1px solid #A7F3DC',
                padding: '3px 9px',
                borderRadius: 999,
              }}>
                Verified
              </span>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                {payments.length}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                Total payment transactions
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Payments Table Panel */}
      <div className="fade-in" style={{ ...panelStyle, minHeight: 280, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: THEME.ink, margin: 0 }}>
              Payment Transactions
            </h3>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              {payments.length} verified transactions on record
            </div>
          </div>

          {/* Quick Search */}
          {payments.length > 0 && (
            <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                <Icon path={icons.search} size={14} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reference, unit, mode..."
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
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: ADMIN_COLORS.red, fontWeight: 600 }}>{error}</div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F8FAFC', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon path={icons.receipt} size={22} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: THEME.ink, margin: 0 }}>
              {searchQuery ? 'No payment records match your search.' : 'No payment records found.'}
            </p>
            <p style={{ fontSize: 12.5, color: THEME.textMuted, marginTop: 4 }}>
              Payment transactions will appear here once recorded and verified.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  <th style={thStyle}>Reference / ID</th>
                  <th style={thStyle}>Unit &amp; Property</th>
                  <th style={thStyle}>Payment Mode</th>
                  <th style={thStyle}>Date</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Amount Paid</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(p => (
                  <tr key={p.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          background: '#F1F5F9',
                          color: '#0F172A',
                          padding: '3px 8px',
                          borderRadius: 6,
                          letterSpacing: '0.4px',
                        }}
                      >
                        {p.reference_number || `#PMT-${String(p.id).padStart(4, '0')}`}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: THEME.ink }}>
                        Unit {p.contract?.unit?.number || '—'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        {p.contract?.unit?.property?.name || 'Assigned Property'}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 9px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: '#F0F9FF',
                          color: '#0284C7',
                          border: '1px solid #BAE6FD',
                        }}
                      >
                        {safeUpper(p.mode || p.type || 'Payment')}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12.5, color: '#334155', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {formatDate(p.payment_date || p.date)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 800, color: '#065F46', fontSize: 14 }}>
                      AED {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '3px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          background: '#ECFDF8',
                          color: '#065F46',
                          border: '1px solid #A7F3DC',
                        }}
                      >
                        <Icon path={icons.check} size={12} />
                        Settled
                      </span>
                    </td>
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
