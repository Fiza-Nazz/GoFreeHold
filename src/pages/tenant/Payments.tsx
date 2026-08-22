import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, ADMIN_COLORS, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'
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
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Payment History</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Past Payments</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>View your payment records</div>
        </div>
      </div>

      {!isLoading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
          <div
            className="gfh-portal-stat"
            style={{
              background: '#065f46',
              color: '#fff',
              borderRadius: 0,
              padding: '20px 18px',
              minHeight: 110,
              boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800 }}>AED {totalAmount.toLocaleString()}</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>Total paid</div>
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
              AED
            </div>
          </div>
          <div
            className="gfh-portal-stat"
            style={{
              background: '#075985',
              color: '#fff',
              borderRadius: 0,
              padding: '20px 18px',
              minHeight: 110,
              boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)',
              animationDelay: '0.06s',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800 }}>{payments.length}</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>Payments</div>
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
              Count
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
