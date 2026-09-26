import { useEffect, useState } from 'react'
import api from '../../api/axios'
import ChequeDetails from '../../components/gfh/ChequeDetails'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

// Local GoFreeHold brand accents (matches sidebar/brand green — doesn't touch shared THEME file)
const GFH = {
  green: '#10B981',
  greenDark: '#065f46',
  greenBg: '#ecfdf5',
  greenBorder: '#a7f3d0',
}

interface Cheque {
  id: number
  contract_id: number
  account_holder_name: string
  payee_name: string
  nature: string
  type: string
  cheque_number: string | null
  bank_name: string
  amount: number
  due_date: string
  notes?: string
  has_cheque_image?: boolean
  cheque_image_name?: string
  status: 'pending' | 'cleared' | 'bounced'
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string; border: string }> = {
  pending:  { bg: '#fffbeb', color: '#b45309', label: 'PENDING',  border: '#fde68a' },
  cleared:  { bg: '#f0fdf4', color: '#065f46', label: 'CLEARED',  border: '#bbf7d0' },
  bounced:  { bg: '#fef2f2', color: '#991b1b', label: 'BOUNCED',  border: '#fecaca' },
}

// --- "Add Cheque" modal theme: image-2 layout, GoFreeHold green accents ---
const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  color: '#111827',
  fontSize: 14.5,
  fontWeight: 500,
  padding: '11px 12px',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color .15s ease, box-shadow .15s ease',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14.5,
  fontWeight: 700,
  color: '#1f2937',
  marginBottom: 8,
}

const requiredMark: React.CSSProperties = { color: '#dc2626', marginLeft: 2 }
const hintStyle: React.CSSProperties = { fontSize: 12, color: '#6b7280', marginTop: 6 }

const modalCss = `
  .gfh-pdc-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(15,23,42,.5); }
  .gfh-pdc-dialog { width: 100%; max-width: 660px; max-height: 94vh; display: flex; flex-direction: column; overflow: hidden; background: #fff; border-radius: 14px; box-shadow: 0 24px 70px rgba(15,23,42,.35); }
  .gfh-pdc-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 26px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; }
  .gfh-pdc-form { display: flex; flex-direction: column; min-height: 0; }
  .gfh-pdc-fields { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 22px 20px; padding: 26px 26px 28px; overflow-y: auto; }
  .gfh-pdc-fields > div { min-width: 0; }
  .gfh-pdc-fields input, .gfh-pdc-fields select { min-height: 46px; }
  .gfh-pdc-dialog input:focus-visible, .gfh-pdc-dialog select:focus-visible, .gfh-pdc-dialog button:focus-visible {
    outline: none; border-color: ${GFH.green}; box-shadow: 0 0 0 3px rgba(15,118,110,0.15);
  }
  .gfh-pdc-close { display: flex; padding: 6px; border: 0; background: transparent; color: #6b7280; cursor: pointer; border-radius: 6px; transition: background .15s ease, color .15s ease; }
  .gfh-pdc-close:hover { background: #f3f4f6; color: #111827; }
  .gfh-pdc-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 26px; border-top: 1px solid #e5e7eb; flex-shrink: 0; background: #fff; }
  .gfh-pdc-btn-close { padding: 11px 22px; border-radius: 8px; border: 1px solid #d1d5db; background: #f9fafb; color: #374151; cursor: pointer; font-weight: 600; font-size: 14px; transition: background .15s ease; }
  .gfh-pdc-btn-close:hover { background: #f3f4f6; }
  .gfh-pdc-btn-submit { padding: 11px 26px; border-radius: 8px; border: none; background: ${GFH.green}; color: #fff; cursor: pointer; font-weight: 700; font-size: 14px; transition: background .15s ease, opacity .15s ease; }
  .gfh-pdc-btn-submit:hover:not(:disabled) { background: ${GFH.greenDark}; }
  .gfh-pdc-btn-submit:disabled { opacity: .65; cursor: not-allowed; }
  .gfh-pdc-file-btn { padding: 9px 14px; border-radius: 6px; border: 1px solid #d1d5db; background: #f3f4f6; color: #374151; font-weight: 600; font-size: 13px; cursor: pointer; }
  @media (max-width: 600px) {
    .gfh-pdc-overlay { padding: 12px; }
    .gfh-pdc-dialog { max-height: 96vh; }
    .gfh-pdc-fields { grid-template-columns: minmax(0,1fr); gap: 18px; padding: 20px 18px; }
    .gfh-pdc-header, .gfh-pdc-footer { padding: 16px 18px; }
  }
`

const emptyForm = {
  account_holder_name: '',
  payee_name: '',
  nature: 'RENT',
  type: '',
  bank_name: '',
  due_date: '',
  amount: '',
  notes: '',
  cheque_number: '',
}

interface PdcChequeTrackerProps {
  // An embedding contract page can preselect its contract; the tracker shows a selector.
  contractId?: number
}

export default function PdcChequeTracker({ contractId }: PdcChequeTrackerProps) {
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  const [cheques, setCheques] = useState<Cheque[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [chequeImage, setChequeImage] = useState<File | null>(null)
  const [selectedContract, setSelectedContract] = useState(contractId ? String(contractId) : '')
  const [contracts, setContracts] = useState<Array<{ id: number; tenant?: { name?: string }; unit?: { number?: string; property?: { name?: string } } }>>([])
  const [formError, setFormError] = useState('')
  const [listError, setListError] = useState('')

  useEffect(() => {
    if (!isModalOpen) return
    api.get(`${basePath}/contracts`).then(res => setContracts(res.data?.data?.contracts || []))
      .catch(() => setFormError('Unable to load contracts. Close this form and try again.'))
  }, [isModalOpen, basePath])

  useEffect(() => { fetchCheques() }, [statusFilter, basePath])

  const fetchCheques = async () => {
    setIsLoading(true)
    setListError('')
    try {
      const url = statusFilter ? `${basePath}/contract-cheques?status=${statusFilter}` : `${basePath}/contract-cheques`
      const res = await api.get(url)
      setCheques(res.data?.data?.cheques || [])
    } catch { setListError('Unable to load cheque records. Please refresh the page.') }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setFormError('')
    if (!selectedContract) { setFormError('Please select a contract.'); return }
    if (chequeImage && (chequeImage.size > 5 * 1024 * 1024 || !/\.(jpe?g|png|pdf)$/i.test(chequeImage.name))) {
      setFormError('Choose a JPG, PNG or PDF file no larger than 5MB.'); return
    }
    setIsSubmitting(true)
    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value))
      payload.append('contract_id', selectedContract)
      if (chequeImage) payload.append('cheque_image', chequeImage)

      await api.post(`${basePath}/contract-cheques`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setIsModalOpen(false)
      fetchCheques()
      setFormData(emptyForm)
      setChequeImage(null)
    } catch (err: any) {
      const errors = err.response?.data?.errors
      setFormError(errors ? Object.values(errors).flat().join(' ') : err.response?.data?.message || 'Unable to save cheque. Please try again.')
    }
    finally { setIsSubmitting(false) }
  }

  const updateStatus = async (cheque: Cheque, status: string) => {
    try {
      await api.put(`${basePath}/contracts/${cheque.contract_id}/cheques/${cheque.id}`, { status })
      fetchCheques()
    } catch (err) { alert('Error updating status') }
  }

  const deleteCheque = async (cheque: Cheque) => {
    if (confirm('Delete this cheque record?')) {
      await api.delete(`${basePath}/contracts/${cheque.contract_id}/cheques/${cheque.id}`)
      fetchCheques()
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{portalPageCss}{modalCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
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
              borderRadius: 8,
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
        {listError ? <p role="alert" style={{ color: '#991b1b' }}>{listError}</p> : isLoading ? (
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
                      <td style={{ ...tdStyle, fontWeight: 700, color: GFH.green }}>GFH-{String(cheque.contract_id).padStart(5,'0')}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{cheque.cheque_number || 'Not provided'}<ChequeDetails cheque={cheque} contractId={cheque.contract_id} /></td>
                      <td style={tdStyle}>{cheque.bank_name}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: GFH.green }}>AED {Number(cheque.amount).toLocaleString()}</td>
                      <td style={tdStyle}>{formatDate(cheque.due_date)}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.3px', backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {cheque.status === 'pending' && <>
                            <button
                              type="button"
                              className="gfh-portal-btn"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 8, border: 'none', background: '#10B981', color: '#fff', cursor: 'pointer' }}
                              onClick={() => updateStatus(cheque, 'cleared')}
                            >
                              <Icon path={ICONS.check} size={12} />
                              Mark Cleared
                            </button>
                            <button
                              type="button"
                              className="gfh-portal-btn"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 8, border: 'none', background: '#991b1b', color: '#fff', cursor: 'pointer' }}
                              onClick={() => updateStatus(cheque, 'bounced')}
                            >
                              <Icon path={ICONS.alert} size={12} />
                              Mark Bounced
                            </button>
                          </>}
                          <button
                            type="button"
                            className="gfh-portal-btn"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#991b1b', cursor: 'pointer' }}
                            onClick={() => deleteCheque(cheque)}
                          >
                            <Icon path={ICONS.trash} size={12} />
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
        <div className="gfh-pdc-overlay">
          <div className="gfh-pdc-dialog" role="dialog" aria-modal="true" aria-labelledby="pdc-dialog-title">
            <div className="gfh-pdc-header">
              <h2 id="pdc-dialog-title" style={{ color: '#111827', margin: 0, fontSize: 22, fontWeight: 700 }}>Add Cheque</h2>
              <button type="button" className="gfh-pdc-close" aria-label="Close add cheque" onClick={() => setIsModalOpen(false)}>
                <Icon path="M6 6l12 12M6 18L18 6" size={20} />
              </button>
            </div>
            <form className="gfh-pdc-form" onSubmit={handleCreate}>
              <div className="gfh-pdc-fields">
                {formError && <div role="alert" style={{ gridColumn: '1 / -1', padding: 12, background: '#FEF2F2', color: '#991b1b' }}>{formError}</div>}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="pdc-contract" style={labelStyle}>Contract<span style={requiredMark}>*</span></label>
                  <select id="pdc-contract" style={inputStyle} value={selectedContract} onChange={e => setSelectedContract(e.target.value)} required disabled={!!contractId}>
                    <option value="">Select tenant / contract</option>
                    {contracts.map(c => <option key={c.id} value={c.id}>GFH-{String(c.id).padStart(5, '0')} — {c.tenant?.name || 'Tenant'} — {c.unit?.property?.name || ''} {c.unit?.number || ''}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="pdc-account_holder_name" style={labelStyle}>Account Holder Name<span style={requiredMark}>*</span></label>
                  <input id="pdc-account_holder_name" type="text" style={inputStyle} placeholder="Account Holder Name" value={formData.account_holder_name} onChange={e => setFormData({...formData, account_holder_name: e.target.value})} required />
                </div>
                <div>
                  <label htmlFor="pdc-payee_name" style={labelStyle}>Payee Name<span style={requiredMark}>*</span></label>
                  <input id="pdc-payee_name" type="text" style={inputStyle} placeholder="Payee Name" value={formData.payee_name} onChange={e => setFormData({...formData, payee_name: e.target.value})} required />
                </div>

                <div>
                  <label htmlFor="pdc-nature" style={labelStyle}>Nature<span style={requiredMark}>*</span></label>
                  <select id="pdc-nature" style={inputStyle} value={formData.nature} onChange={e => setFormData({...formData, nature: e.target.value})} required>
                    <option value="RENT">RENT</option>
                    <option value="DEPOSIT">DEPOSIT</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="pdc-type" style={labelStyle}>Type<span style={requiredMark}>*</span></label>
                  <input id="pdc-type" type="text" style={inputStyle} placeholder="e.g. CROSS" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required />
                </div>

                <div>
                  <label htmlFor="pdc-bank_name" style={labelStyle}>Bank<span style={requiredMark}>*</span></label>
                  <input id="pdc-bank_name" type="text" style={inputStyle} placeholder="Bank" value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})} required />
                </div>
                <div>
                  <label htmlFor="pdc-due_date" style={labelStyle}>Date<span style={requiredMark}>*</span></label>
                  <input id="pdc-due_date" type="date" style={inputStyle} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} required />
                </div>

                <div>
                  <label htmlFor="pdc-amount" style={labelStyle}>Amount<span style={requiredMark}>*</span></label>
                  <input id="pdc-amount" type="number" min="0.01" max="99999999.99" step="0.01" style={inputStyle} placeholder="Amount" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                </div>
                <div>
                  <label htmlFor="pdc-notes" style={labelStyle}>Remarks<span style={requiredMark}>*</span></label>
                  <input id="pdc-notes" type="text" style={inputStyle} placeholder="Remarks" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} required />
                </div>

                <div>
                  <label htmlFor="pdc-cheque_number" style={labelStyle}>Cheque No</label>
                  <input id="pdc-cheque_number" type="text" style={inputStyle} placeholder="Cheque number" value={formData.cheque_number} onChange={e => setFormData({...formData, cheque_number: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="pdc-cheque_image" style={labelStyle}>Cheque Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label htmlFor="pdc-cheque_image" className="gfh-pdc-file-btn">Choose File</label>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{chequeImage ? chequeImage.name : 'No file chosen'}</span>
                  </div>
                  <input
                    id="pdc-cheque_image"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    style={{ display: 'none' }}
                    onChange={e => setChequeImage(e.target.files?.[0] || null)}
                  />
                  <p style={hintStyle}>Optional. JPG, PNG or PDF, max 5MB.</p>
                </div>
              </div>
              <div className="gfh-pdc-footer">
                <button type="button" className="gfh-pdc-btn-close" onClick={() => setIsModalOpen(false)}>Close</button>
                <button type="submit" className="gfh-pdc-btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
