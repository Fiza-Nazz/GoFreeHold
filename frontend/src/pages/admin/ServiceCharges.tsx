import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface ServiceCharge {
  id: number
  contract_id: number
  unit_id: number
  charge_type: string
  amount: number
  due_date: string
  paid_date?: string
  status: 'pending' | 'paid' | 'waived'
  notes?: string
  unit?: { number: string; property?: { name: string } }
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  pending: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  paid:    { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
  waived:  { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  color: THEME.ink,
  fontSize: 14,
  fontWeight: 600,
  padding: '10px 12px',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 800,
  color: THEME.purple,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

const btnTint = {
  paid:   { bg: '#065f46', color: '#ffffff', border: 'none' },
  waive:  { bg: '#b45309', color: '#ffffff', border: 'none' },
  delete: { bg: '#991b1b', color: '#ffffff', border: 'none' },
  cancel: { bg: '#f1f5f9', color: THEME.textMuted, border: `1px solid ${THEME.border}` },
}

export default function ServiceCharges() {
  const [charges, setCharges] = useState<ServiceCharge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ contract_id: '', unit_id: '', charge_type: 'maintenance', amount: '', due_date: '', notes: '' })

  useEffect(() => { fetchCharges() }, [statusFilter])

  const fetchCharges = async () => {
    setIsLoading(true)
    try {
      const url = statusFilter ? `/admin/service-charges?status=${statusFilter}` : '/admin/service-charges'
      const res = await api.get(url)
      setCharges(res.data?.data?.charges || [])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/service-charges', formData)
      setIsModalOpen(false)
      fetchCharges()
      setFormData({ contract_id: '', unit_id: '', charge_type: 'maintenance', amount: '', due_date: '', notes: '' })
    } catch (err) { alert('Error creating service charge') }
  }

  const markPaid = async (id: number) => {
    try {
      await api.put(`/admin/service-charges/${id}`, { status: 'paid', paid_date: new Date().toISOString().split('T')[0] })
      fetchCharges()
    } catch (err) { alert('Error updating charge') }
  }

  const markWaived = async (id: number) => {
    try {
      await api.put(`/admin/service-charges/${id}`, { status: 'waived' })
      fetchCharges()
    } catch (err) { alert('Error updating charge') }
  }

  const deleteCharge = async (id: number) => {
    if (confirm('Delete this service charge?')) {
      await api.delete(`/admin/service-charges/${id}`)
      fetchCharges()
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Service Charges
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Manage maintenance, utilities, and other recurring charges
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              borderRadius: 0,
              border: `1px solid ${THEME.border}`,
              background: '#ffffff',
              color: THEME.ink,
              fontSize: 13.5,
              fontWeight: 600,
              padding: '10px 14px',
            }}
          >
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="waived">Waived</option>
          </select>
          <button
            className="gfh-portal-btn"
            onClick={() => setIsModalOpen(true)}
            style={ghostBtnStyle}
          >
            <Icon path="M12 5v14M5 12h14" size={15} />
            Add charge
          </button>
        </div>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : charges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14.5, color: THEME.textMuted, fontWeight: 600 }}>
              No service charges found.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {charges.map(charge => {
              const st = STATUS_STYLE[charge.status]
              return (
                <div
                  key={charge.id}
                  className="gfh-portal-stat"
                  style={{
                    position: 'relative',
                    padding: 20,
                    backgroundColor: '#fff',
                    borderRadius: 0,
                    border: `1px solid ${THEME.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 20,
                    flexWrap: 'wrap',
                  }}
                >
                  <CornerBrackets />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                      <strong style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: '0.3px', color: THEME.ink }}>
                        {(charge.charge_type || '—').toString().replace(/_/g, ' ').toUpperCase()}
                      </strong>
                      <span style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '3px 11px', borderRadius: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.3px' }}>
                        {(charge.status || '—').toString().toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: 13.5, color: THEME.textMuted, fontWeight: 600, margin: 0 }}>
                      Contract: GFH-{String(charge.contract_id).padStart(5, '0')} &nbsp;|&nbsp; Due: {formatDate(charge.due_date)}
                      {charge.paid_date && ` | Paid: ${formatDate(charge.paid_date)}`}
                    </p>
                    {charge.notes && (
                      <p style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 500, marginTop: 5, marginBottom: 0 }}>
                        {charge.notes}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <strong style={{ fontSize: 18.5, fontWeight: 800, color: charge.status === 'paid' ? '#065f46' : THEME.ink, letterSpacing: '0.2px' }}>
                      AED {Number(charge.amount).toLocaleString()}
                    </strong>
                    {charge.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="gfh-portal-btn"
                          style={{ padding: '6px 12px', fontSize: 12.5, fontWeight: 700, backgroundColor: btnTint.paid.bg, border: btnTint.paid.border, borderRadius: 0, color: btnTint.paid.color, cursor: 'pointer' }}
                          onClick={() => markPaid(charge.id)}
                        >
                          Mark paid
                        </button>
                        <button
                          className="gfh-portal-btn"
                          style={{ padding: '6px 12px', fontSize: 12.5, fontWeight: 700, borderRadius: 0, backgroundColor: btnTint.waive.bg, color: btnTint.waive.color, border: btnTint.waive.border, cursor: 'pointer' }}
                          onClick={() => markWaived(charge.id)}
                        >
                          Waive
                        </button>
                      </div>
                    )}
                    <button
                      className="gfh-portal-btn"
                      style={{ padding: '6px 12px', fontSize: 12.5, fontWeight: 700, borderRadius: 0, backgroundColor: btnTint.delete.bg, color: btnTint.delete.color, border: btnTint.delete.border, cursor: 'pointer' }}
                      onClick={() => deleteCharge(charge.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,61,58,0.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 480,
              padding: 30,
              background: '#ffffff',
              borderRadius: 0,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 20px 50px rgba(15,61,58,0.3)',
            }}
          >
            <CornerBrackets />
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 20,
                color: THEME.ink,
              }}
            >
              Add service charge
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Contract ID</label>
                  <input type="number" style={inputStyle} value={formData.contract_id} onChange={e => setFormData({...formData, contract_id: e.target.value})} required />
                </div>
                <div>
                  <label style={labelStyle}>Unit ID</label>
                  <input type="number" style={inputStyle} value={formData.unit_id} onChange={e => setFormData({...formData, unit_id: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Charge type</label>
                  <select style={inputStyle} value={formData.charge_type} onChange={e => setFormData({...formData, charge_type: e.target.value})}>
                    <option value="maintenance">Maintenance</option>
                    <option value="utilities">Utilities</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Amount (AED)</label>
                  <input type="number" style={inputStyle} value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Due date</label>
                <input type="date" style={inputStyle} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} required />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="gfh-portal-btn"
                  onClick={() => setIsModalOpen(false)}
                  style={{ borderRadius: 0, fontWeight: 700, fontSize: 13.5, padding: '10px 18px', backgroundColor: btnTint.cancel.bg, color: btnTint.cancel.color, border: btnTint.cancel.border, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gfh-portal-btn"
                  style={ghostBtnStyle}
                >
                  Add charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
