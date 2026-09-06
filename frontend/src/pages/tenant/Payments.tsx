import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

interface TenantPayment {
  id: number
  amount: number | string
  type?: string
  date?: string
  payment_date?: string
  reference_number?: string | null
  contract?: {
    unit?: { number?: string; property?: { name?: string } }
  }
}

const icons = {
  receipt: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  card: 'M12 5v14M5 12h14',
}

export default function TenantPayments() {
  const [payments, setPayments] = useState<TenantPayment[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Payment History</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Past Payments</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>View your payment records</div>
        </div>
      </div>

      {!isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
          <div
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
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#F0FDF4',
                color: '#0F8A67',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon path={icons.card} size={20} />
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
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                AED {totalAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                Total paid
              </div>
            </div>
          </div>

          <div
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
              animationDelay: '0.06s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#ECFDF8',
                color: '#0E5E48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon path={icons.receipt} size={20} />
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
                Count
              </span>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                {payments.length}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                Total payments
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fade-in" style={{ ...panelStyle, minHeight: 280 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: ADMIN_COLORS.red, fontWeight: 600 }}>{error}</div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No past payments found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Type', 'Reference', 'Unit / property', 'Date', 'Amount (AED)'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#075985' }}>
                      {safeUpper(String(p.type || 'payment').replace(/_/g, ' '))}
                    </td>
                    <td style={tdStyle}>{p.reference_number || '—'}</td>
                    <td style={tdStyle}>
                      {p.contract?.unit?.number
                        ? `Unit ${p.contract.unit.number}${p.contract.unit.property?.name ? `, ${p.contract.unit.property.name}` : ''}`
                        : '—'}
                    </td>
                    <td style={tdStyle}>{formatDate(p.date || p.payment_date)}</td>
                    <td style={{ ...tdStyle, color: '#065f46', fontWeight: 700 }}>{Number(p.amount || 0).toLocaleString()}</td>
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
