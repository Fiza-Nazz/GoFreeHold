import { useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, CornerBrackets, portalPageCss, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface Unit {
  id: number
  number: string
  property?: { id: number; name: string }
  price: number
}

interface BookingFormProps {
  unit: Unit
  onClose: () => void
  onSuccess: () => void
}

const icons = {
  close: 'M18 6 6 18M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  fontSize: 14,
  fontWeight: 500,
  background: '#fff',
  color: THEME.ink,
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: THEME.purple,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export default function BookingForm({ unit, onClose, onSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({ tenant_name: '', amount: '', notes: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [receipt, setReceipt] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await api.post('/admin/units/book', {
        unit_id: unit.id,
        tenant_name: formData.tenant_name,
        amount: formData.amount,
        notes: formData.notes,
      })
      setReceipt(res.data.data.receipt)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process booking.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 61, 58, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <style>{portalPageCss}</style>
      <div
        className="fade-in gfh-portal-page"
        style={{
          position: 'relative',
          width: 480,
          maxWidth: '100%',
          background: '#fff',
          border: `1px solid ${THEME.border}`,
          borderRadius: 0,
          padding: 28,
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}
      >
        <CornerBrackets />
        {!receipt ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: THEME.ink, margin: 0 }}>
                Advance Booking
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="gfh-portal-btn"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: THEME.textMuted, padding: 4 }}
                aria-label="Close"
              >
                <Icon path={icons.close} size={18} />
              </button>
            </div>
            <p style={{ marginBottom: 20, fontSize: 14, color: THEME.textMuted }}>
              Unit <strong style={{ color: THEME.ink }}>{unit.number}</strong>
              {unit.property?.name ? ` — ${unit.property.name}` : ''}
            </p>

            {error && (
              <div style={{ padding: 10, marginBottom: 15, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontWeight: 600, fontSize: 13 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label style={labelStyle}>Prospective Tenant Name</label>
                <input
                  style={inputStyle}
                  placeholder="Enter tenant full name"
                  value={formData.tenant_name}
                  onChange={e => setFormData({ ...formData, tenant_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Advance Amount (AED)</label>
                <input
                  type="number"
                  style={inputStyle}
                  placeholder="e.g. 5000"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  min={1}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Notes (Optional)</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical' }}
                  rows={3}
                  placeholder="Any additional notes..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 5, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="gfh-portal-btn"
                  onClick={onClose}
                  style={{ ...ghostBtnStyle, background: '#fff', color: THEME.ink, border: `1px solid ${THEME.border}` }}
                >
                  Cancel
                </button>
                <button type="submit" className="gfh-portal-btn" disabled={isLoading} style={{ ...ghostBtnStyle, opacity: isLoading ? 0.6 : 1 }}>
                  {isLoading ? 'Saving…' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  margin: '0 auto 12px',
                  background: 'linear-gradient(135deg, #22c55e, #15803d)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon path={icons.check} size={22} />
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: THEME.ink, margin: 0 }}>
                Booking Confirmed!
              </h2>
              <p style={{ color: THEME.textMuted, fontSize: 14, marginTop: 6 }}>Cash Receipt Generated</p>
            </div>
            <div style={{ border: `1px solid ${THEME.border}`, padding: 20, marginBottom: 20 }}>
              {[
                ['Receipt #', receipt.receipt_number],
                ['Unit', `Unit ${unit.number}`],
                ['Tenant Name', receipt.tenant_name],
                ['Date', receipt.date],
              ].map(([label, value]) => (
                <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${THEME.border}` }}>
                  <span style={{ color: THEME.textMuted, fontSize: 13 }}>{label}</span>
                  <strong style={{ color: THEME.ink }}>{value}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ color: THEME.textMuted, fontSize: 13 }}>Amount Received</span>
                <strong style={{ color: '#065f46', fontSize: 18 }}>AED {Number(receipt.amount).toLocaleString()}</strong>
              </div>
            </div>
            <button type="button" className="gfh-portal-btn" style={{ ...ghostBtnStyle, width: '100%', justifyContent: 'center' }} onClick={onSuccess}>
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}
