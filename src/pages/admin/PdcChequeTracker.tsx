import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface Cheque {
  id: number
  contract_id: number
  cheque_number: string
  bank_name: string
  amount: number
  due_date: string
  status: 'pending' | 'cleared' | 'bounced'
  notes?: string
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string; border: string }> = {
  pending:  { bg: '#fffbeb', color: '#b45309', label: 'PENDING',  border: '#fde68a' },
  cleared:  { bg: '#f0fdf4', color: '#065f46', label: 'CLEARED',  border: '#bbf7d0' },
  bounced:  { bg: '#fef2f2', color: '#991b1b', label: 'BOUNCED',  border: '#fecaca' },
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
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  color: THEME.purpleMid,
  marginBottom: 6,
}

const actionBtnBase: React.CSSProperties = {
  padding: '5px 10px',
  fontSize: 11,
  fontWeight: 700,
  borderRadius: 0,
  background: '#fff',
}

const sectionStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderLeft: `3px solid ${THEME.violetLight}`,
  padding: '18px 20px',
  marginBottom: 16,
  borderRadius: 0,
}

export default function PdcChequeTracker() {
  const [cheques, setCheques] = useState<Cheque[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ contract_id: '', cheque_number: '', bank_name: '', amount: '', due_date: '', notes: '' })

  useEffect(() => { fetchCheques() }, [statusFilter])

  const fetchCheques = async () => {
    setIsLoading(true)
    try {
      const url = statusFilter ? `/admin/contract-cheques?status=${statusFilter}` : '/admin/contract-cheques'
      const res = await api.get(url)
      setCheques(res.data?.data?.cheques || [])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post(`/admin/contracts/${formData.contract_id}/cheques`, formData)
      setIsModalOpen(false)
      fetchCheques()
      setFormData({ contract_id: '', cheque_number: '', bank_name: '', amount: '', due_date: '', notes: '' })
    } catch (err) { alert('Error adding cheque') }
  }

  const updateStatus = async (cheque: Cheque, status: string) => {
    try {
      await api.put(`/admin/contracts/${cheque.contract_id}/cheques/${cheque.id}`, { status })
      fetchCheques()
    } catch (err) { alert('Error updating status') }
  }

  const deleteCheque = async (cheque: Cheque) => {
    if (confirm('Delete this cheque record?')) {
      await api.delete(`/admin/contracts/${cheque.contract_id}/cheques/${cheque.id}`)
      fetchCheques()
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            PDC Cheque Tracker
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Manage post-dated cheques linked to contracts
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
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="cleared">Cleared</option>
            <option value="bounced">Bounced</option>
          </select>
          <button className="gfh-portal-btn" onClick={() => setIsModalOpen(true)} style={ghostBtnStyle}>
            <Icon path="M12 5v14M5 12h14" size={15} />
            Add Cheque
          </button>
        </div>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : cheques.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: THEME.textMuted, fontWeight: 500 }}>No cheque records found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Contract', 'Cheque #', 'Bank', 'Amount (AED)', 'Due Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cheques.map(cheque => {
                  const st = STATUS_STYLE[cheque.status]
                  return (
                    <tr key={cheque.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: THEME.purple }}>GFH-{String(cheque.contract_id).padStart(5,'0')}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{cheque.cheque_number}</td>
                      <td style={tdStyle}>{cheque.bank_name}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: THEME.violet }}>AED {Number(cheque.amount).toLocaleString()}</td>
                      <td style={tdStyle}>{formatDate(cheque.due_date)}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '4px 10px', borderRadius: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.3px', backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {cheque.status === 'pending' && <>
                            <button
                              type="button"
                              className="gfh-portal-btn"
                              style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 0, border: 'none', background: '#065f46', color: '#fff', cursor: 'pointer' }}
                              onClick={() => updateStatus(cheque, 'cleared')}
                            >
                              Mark Cleared
                            </button>
                            <button
                              type="button"
                              className="gfh-portal-btn"
                              style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 0, border: 'none', background: '#991b1b', color: '#fff', cursor: 'pointer' }}
                              onClick={() => updateStatus(cheque, 'bounced')}
                            >
                              Mark Bounced
                            </button>
                          </>}
                          <button
                            type="button"
                            className="gfh-portal-btn"
                            style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 0, border: 'none', background: '#fef2f2', color: '#991b1b', cursor: 'pointer' }}
                            onClick={() => deleteCheque(cheque)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,61,58,0.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ position: 'relative', width: 520, padding: 0, maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: 0, border: `1px solid ${THEME.border}`, boxShadow: '0 20px 60px rgba(15,61,58,0.35)' }}>
            <CornerBrackets />
            <div style={{ background: `linear-gradient(135deg, ${THEME.purpleDark}, ${THEME.purpleMid})`, padding: '22px 28px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fff', margin: 0, fontSize: 22, fontWeight: 700 }}>Add PDC Cheque</h2>
              <p style={{ color: THEME.textMuted, fontSize: 13, margin: '4px 0 0' }}>Record a post-dated cheque against a contract</p>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', padding: '24px 28px 28px' }}>

              <div style={sectionStyle}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: THEME.violetLight, margin: '0 0 14px' }}>Contract Reference</p>
                <div>
                  <label style={labelStyle}>Contract ID</label>
                  <input type="number" style={inputStyle} placeholder="e.g. 1" value={formData.contract_id} onChange={e => setFormData({...formData, contract_id: e.target.value})} required />
                </div>
              </div>

              <div style={sectionStyle}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: THEME.violetLight, margin: '0 0 14px' }}>Cheque Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Cheque Number</label>
                    <input style={inputStyle} value={formData.cheque_number} onChange={e => setFormData({...formData, cheque_number: e.target.value})} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Bank Name</label>
                    <input style={inputStyle} value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})} required />
                  </div>
                </div>
              </div>

              <div style={sectionStyle}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: THEME.violetLight, margin: '0 0 14px' }}>Amount &amp; Due Date</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Amount (AED)</label>
                    <input type="number" style={inputStyle} value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Due Date</label>
                    <input type="date" style={inputStyle} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} required />
                  </div>
                </div>
              </div>

              <div style={{ ...sectionStyle, marginBottom: 22 }}>
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: THEME.violetLight, margin: '0 0 14px' }}>Additional Notes</p>
                <div>
                  <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} placeholder="Any remarks about this cheque..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="gfh-portal-btn"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '11px 20px', border: `1.5px solid ${THEME.border}`, background: '#fff', color: THEME.textMuted, cursor: 'pointer', fontWeight: 700, fontSize: 13, borderRadius: 0 }}
                >
                  Cancel
                </button>
                <button type="submit" className="gfh-portal-btn" style={ghostBtnStyle}>
                  Save Cheque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
