import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

const PAYMENT_TYPES = ['rent', 'dewa', 'deposit', 'settlement', 'service_charge', 'other']
const MODES = ['cash', 'card', 'bank_transfer', 'cheque', 'online']

interface PaymentFormProps {
  onSuccess?: () => void
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  color: THEME.ink,
  fontSize: 14,
  fontWeight: 500,
  padding: '10px 12px',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  color: THEME.purpleMid,
  marginBottom: 6,
  display: 'block',
}

const sectionStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderLeft: `3px solid ${THEME.violetLight}`,
  borderRadius: 0,
  padding: '18px 20px',
}

export default function PaymentForm({ onSuccess }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    contract_id: '', tenant_id: '', type: 'rent', mode: 'cash',
    amount: '', date: new Date().toISOString().split('T')[0],
    reference_number: '', remarks: ''
  })
  const [contracts, setContracts] = useState<Array<{ id: number; tenant_id: number; tenant?: { name?: string }; unit?: { number?: string } }>>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [lastPayment, setLastPayment] = useState<any>(null)

  useEffect(() => {
    api.get('/admin/contracts')
      .then(res => setContracts(res.data?.data?.contracts || []))
      .catch(() => setContracts([]))
  }, [])

  const handleContractPick = (contractId: string) => {
    const c = contracts.find(x => String(x.id) === contractId)
    setFormData(prev => ({
      ...prev,
      contract_id: contractId,
      tenant_id: c ? String(c.tenant_id) : prev.tenant_id,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await api.post('/admin/payments', formData)
      setLastPayment(res.data.data.payment)
      setStatus('success')
      setMessage('Payment recorded successfully!')
      if (onSuccess) onSuccess()
      // Reset
      setFormData(prev => ({ ...prev, amount: '', reference_number: '', remarks: '' }))
    } catch (err: any) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Failed to record payment.')
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Record Payment
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Multi-mode payment entry for Rent, DEWA, Deposit, and more
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div className="fade-in" style={{ ...panelStyle, minHeight: 0 }}>
          <CornerBrackets />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            <div style={sectionStyle}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: THEME.violetLight, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon path="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" size={14} />
                Payment Type
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {PAYMENT_TYPES.map(cat => (
                  <button
                    key={cat} type="button"
                    onClick={() => setFormData({ ...formData, type: cat })}
                    className="gfh-portal-btn"
                    style={{
                      padding: '10px 8px',
                      borderRadius: 0,
                      border: `1.5px solid ${formData.type === cat ? '#1e1b4b' : THEME.border}`,
                      background: formData.type === cat ? '#1e1b4b' : '#ffffff',
                      color: formData.type === cat ? '#fff' : THEME.ink,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    {cat.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: THEME.violetLight, margin: '0 0 14px' }}>
                Payment Mode
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {MODES.map(mode => (
                  <button
                    key={mode} type="button"
                    onClick={() => setFormData({ ...formData, mode })}
                    className="gfh-portal-btn"
                    style={{
                      padding: '6px 14px',
                      borderRadius: 0,
                      border: `1.5px solid ${formData.mode === mode ? '#075985' : THEME.border}`,
                      background: formData.mode === mode ? '#075985' : 'transparent',
                      color: formData.mode === mode ? '#fff' : THEME.ink,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {mode.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: THEME.violetLight, margin: '0 0 14px' }}>
                Contract &amp; Tenant
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Contract</label>
                  <select style={inputStyle} value={formData.contract_id} onChange={e => handleContractPick(e.target.value)} required>
                    <option value="">Select contract</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>
                        #{c.id}{c.unit?.number ? ` · Unit ${c.unit.number}` : ''}{c.tenant?.name ? ` · ${c.tenant.name}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Tenant ID</label>
                  <input type="number" style={inputStyle} value={formData.tenant_id} onChange={e => setFormData({ ...formData, tenant_id: e.target.value })} required readOnly={!!formData.contract_id} />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: THEME.violetLight, margin: '0 0 14px' }}>
                Amount &amp; Date
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Amount (AED)</label>
                  <input type="number" style={inputStyle} placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required min={1} />
                </div>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" style={inputStyle} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: THEME.violetLight, margin: '0 0 14px' }}>
                Additional Details
              </p>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Reference Number (Optional)</label>
                <input style={inputStyle} placeholder="e.g. cheque no., bank ref." value={formData.reference_number} onChange={e => setFormData({ ...formData, reference_number: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Remarks (Optional)</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} />
              </div>
            </div>

            {message && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 0,
                fontSize: 13,
                fontWeight: 600,
                border: '1.5px solid',
                background: status === 'success' ? '#f0fdf4' : '#fef2f2',
                color: status === 'success' ? '#065f46' : '#991b1b',
                borderColor: status === 'success' ? '#bbf7d0' : '#fecaca',
              }}>
                {message}
              </div>
            )}

            <button type="submit" className="gfh-portal-btn" style={{ ...ghostBtnStyle, justifyContent: 'center', width: '100%', background: '#065f46' }} disabled={status === 'loading'}>
              {status === 'loading' ? <span className="spinner" /> : 'Record Payment'}
            </button>
          </form>
        </div>

        <div className="fade-in" style={{ ...panelStyle, minHeight: 0 }}>
          <CornerBrackets />
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: THEME.violetLight, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon path="M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" size={14} />
            Last Payment Receipt
          </p>
          {lastPayment ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ ...sectionStyle, borderLeft: `1px solid ${THEME.border}` }}>
                {[
                  ['Payment ID', `#${lastPayment.id}`],
                  ['Type', lastPayment.type?.toUpperCase()],
                  ['Mode', lastPayment.mode?.replace('_', ' ').toUpperCase()],
                  ['Tenant', lastPayment.tenant?.name],
                  ['Date', formatDate(lastPayment.date)],
                ].map(([label, value]) => (
                  <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${THEME.border}` }}>
                    <span style={{ color: THEME.textMuted, fontSize: 13 }}>{label}</span>
                    <strong style={{ color: THEME.ink }}>{value}</strong>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                  <span style={{ color: THEME.textMuted, fontSize: 13 }}>Amount</span>
                  <strong style={{ fontSize: 20, color: THEME.violet }}>AED {Number(lastPayment.amount).toLocaleString()}</strong>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: 12, color: THEME.textMuted }}>Recorded by {lastPayment.recorded_by?.name}</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: THEME.textMuted }}>
              <p>Receipt will appear here after recording a payment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
