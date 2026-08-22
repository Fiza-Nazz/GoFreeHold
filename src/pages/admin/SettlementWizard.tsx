import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface Settlement {
  id: number
  owner_id: number
  contract_id?: number | null
  vacant_date: string
  dues: number
  receivable: number
  on_case: boolean
  status: string
  owner?: { id: number; name: string; email?: string }
  contract?: {
    id: number
    status?: string
    unit?: { id: number; number: string; status?: string; property?: { name: string } }
    tenant?: { id: number; name: string }
  }
  docs?: { id: number; file_name: string }[]
  payments?: { id: number; amount: number; payment_method?: string; payment_date: string }[]
}

interface ActiveContract {
  id: number
  status: string
  owner_id: number
  tenant_id: number
  rent_amount: number
  unit?: { id: number; number: string; status?: string; property?: { name: string } }
  tenant?: { id: number; name: string }
  owner?: { id: number; name: string }
}

interface Owner {
  id: number
  name: string
  email?: string
  user_id?: number
}

const icons = {
  plus: 'M12 5v14M5 12h14',
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

const emptyForm = () => ({
  contract_id: '',
  owner_id: '',
  vacant_date: new Date().toISOString().split('T')[0],
  dues: '0',
  receivable: '0',
  on_case: false,
  status: 'pending',
})

export default function SettlementWizard() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [activeContracts, setActiveContracts] = useState<ActiveContract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(emptyForm())
  const [createdSettlement, setCreatedSettlement] = useState<Settlement | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [payForm, setPayForm] = useState({ amount: '', payment_method: 'bank_transfer', payment_date: new Date().toISOString().split('T')[0] })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettlements()
    fetchOwners()
    fetchActiveContracts()
  }, [])

  const fetchOwners = async () => {
    try {
      const res = await api.get('/admin/properties/owners')
      setOwners(res.data?.data?.owner_profiles || [])
    } catch (err) { console.error(err) }
  }

  const fetchActiveContracts = async () => {
    try {
      const res = await api.get('/admin/contracts')
      const all = res.data?.data?.contracts || []
      setActiveContracts(all.filter((c: ActiveContract) => c.status === 'active'))
    } catch (err) { console.error(err) }
  }

  const fetchSettlements = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/admin/settlements')
      setSettlements(res.data?.data?.settlements || [])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const pickContract = (contractId: string) => {
    const c = activeContracts.find(x => String(x.id) === contractId)
    const ownerProfile = c ? owners.find(o => o.user_id === c.owner_id) : undefined
    setFormData(prev => ({
      ...prev,
      contract_id: contractId,
      owner_id: ownerProfile ? String(ownerProfile.id) : prev.owner_id,
    }))
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCreatedSettlement(null)
    setDocFile(null)
    setPayForm({ amount: '', payment_method: 'bank_transfer', payment_date: new Date().toISOString().split('T')[0] })
    setFormData(emptyForm())
    setMessage('')
    fetchSettlements()
    fetchActiveContracts()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const res = await api.post('/admin/settlements', {
        contract_id: formData.contract_id,
        owner_id: formData.owner_id || undefined,
        vacant_date: formData.vacant_date,
        dues: formData.dues,
        receivable: formData.receivable,
        on_case: formData.on_case,
        status: formData.status,
      })
      const settlement = res.data.data.settlement as Settlement
      setCreatedSettlement(settlement)
      setMessage(settlement.status === 'completed'
        ? 'Settlement created and completed — linked unit should now be AVAILABLE.'
        : 'Settlement created. You can attach documents, record a payment, then mark it completed.')
      fetchSettlements()
      fetchActiveContracts()
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.errors?.contract_id?.[0] || 'Error processing settlement')
    } finally {
      setBusy(false)
    }
  }

  const uploadDoc = async () => {
    if (!createdSettlement || !docFile) return
    setBusy(true)
    try {
      const body = new FormData()
      body.append('settlement_id', String(createdSettlement.id))
      body.append('file', docFile)
      await api.post('/admin/settlement-docs', body)
      const show = await api.get(`/admin/settlements/${createdSettlement.id}`)
      setCreatedSettlement(show.data.data.settlement)
      setDocFile(null)
      setMessage('Document uploaded.')
      fetchSettlements()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Document upload failed')
    } finally {
      setBusy(false)
    }
  }

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createdSettlement) return
    setBusy(true)
    try {
      await api.post('/admin/settlement-payments', {
        settlement_id: createdSettlement.id,
        amount: payForm.amount,
        payment_method: payForm.payment_method,
        payment_date: payForm.payment_date,
      })
      const show = await api.get(`/admin/settlements/${createdSettlement.id}`)
      setCreatedSettlement(show.data.data.settlement)
      setPayForm({ amount: '', payment_method: 'bank_transfer', payment_date: new Date().toISOString().split('T')[0] })
      setMessage('Settlement payment recorded.')
      fetchSettlements()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment failed')
    } finally {
      setBusy(false)
    }
  }

  const markCompleted = async (settlementId: number) => {
    setBusy(true)
    try {
      const res = await api.put(`/admin/settlements/${settlementId}`, { status: 'completed' })
      const updated = res.data.data.settlement as Settlement
      setMessage(`Settlement #${settlementId} completed. Contract vacated; unit AVAILABLE.`)
      if (createdSettlement?.id === settlementId) setCreatedSettlement(updated)
      await fetchSettlements()
      await fetchActiveContracts()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not complete settlement')
    } finally {
      setBusy(false)
    }
  }

  const selectedContract = activeContracts.find(c => String(c.id) === formData.contract_id)

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Owner Settlements
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Move-out settlements linked to an active contract — completing frees the unit
          </p>
        </div>
        <button
          className="gfh-portal-btn"
          onClick={() => { setCreatedSettlement(null); setFormData(emptyForm()); setIsModalOpen(true) }}
          style={ghostBtnStyle}
        >
          <Icon path={icons.plus} size={15} />
          New Settlement
        </button>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : settlements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14.5, color: THEME.textMuted, fontWeight: 600 }}>No settlement records found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Owner', 'Contract / Unit', 'Vacant Date', 'Dues (AED)', 'Receivable (AED)', 'On Case', 'Status', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {settlements.map(s => (
                  <tr key={s.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{s.owner?.name || `Owner #${s.owner_id}`}</td>
                    <td style={{ ...tdStyle, fontSize: 13, fontWeight: 600 }}>
                      {s.contract_id ? (
                        <>
                          GFH-{String(s.contract_id).padStart(5, '0')}
                          <br />
                          <span style={{ color: THEME.textMuted, fontWeight: 500 }}>
                            {s.contract?.unit?.number || '—'} {s.contract?.unit?.property?.name ? `(${s.contract.unit.property.name})` : ''}
                            {s.contract?.tenant?.name ? ` · ${s.contract.tenant.name}` : ''}
                          </span>
                        </>
                      ) : '—'}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{formatDate(s.vacant_date)}</td>
                    <td style={{ ...tdStyle, color: '#991b1b', fontWeight: 700 }}>AED {Number(s.dues).toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#065f46', fontWeight: 800 }}>AED {Number(s.receivable).toLocaleString()}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>
                      {s.on_case ? (
                        <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '3px 8px', fontSize: 11, fontWeight: 700, borderRadius: 0 }}>LEGAL CASE ACTIVE</span>
                      ) : (
                        <span style={{ color: THEME.textMuted }}>No</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: s.status === 'completed' ? '#f0fdf4' : '#fffbeb', color: s.status === 'completed' ? '#065f46' : '#b45309', border: `1px solid ${s.status === 'completed' ? '#bbf7d0' : '#fde68a'}`, padding: '4px 11px', borderRadius: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.3px' }}>
                        {(s.status || '—').toString().toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {s.status !== 'completed' && s.contract_id && (
                        <button
                          className="gfh-portal-btn"
                          disabled={busy}
                          onClick={() => markCompleted(s.id)}
                          style={{ padding: '6px 10px', fontSize: 12, fontWeight: 700, borderRadius: 0, border: 'none', background: '#065f46', color: '#fff', cursor: 'pointer' }}
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,61,58,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="fade-in" style={{ position: 'relative', width: 560, padding: 30, maxHeight: '92vh', overflowY: 'auto', background: '#ffffff', borderRadius: 0, border: `1px solid ${THEME.border}`, boxShadow: '0 24px 55px -18px rgba(15,61,58,0.35)' }}>
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 800, marginBottom: 6, color: THEME.ink }}>
              {createdSettlement ? `Settlement #${createdSettlement.id}` : 'New Settlement'}
            </h2>
            <p style={{ marginBottom: 16, fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>
              {createdSettlement
                ? 'Attach documents, record payments, then mark completed to free the unit.'
                : 'Select an active contract (unit/tenant). Completing will vacate the contract and set the unit AVAILABLE.'}
            </p>

            {message && (
              <div style={{ marginBottom: 14, padding: '10px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: 13, fontWeight: 600 }}>
                {message}
              </div>
            )}

            {!createdSettlement ? (
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Active Contract (Unit / Tenant)</label>
                  <select style={inputStyle} value={formData.contract_id} onChange={e => pickContract(e.target.value)} required>
                    <option value="">Select active contract</option>
                    {activeContracts.map(c => (
                      <option key={c.id} value={c.id}>
                        #{c.id} · Unit {c.unit?.number || '?'} · {c.tenant?.name || 'Tenant'} · {c.unit?.property?.name || ''}
                      </option>
                    ))}
                  </select>
                  {selectedContract && (
                    <p style={{ marginTop: 8, fontSize: 12.5, color: THEME.purple, fontWeight: 600 }}>
                      Unit {selectedContract.unit?.number} ({selectedContract.unit?.status || '—'}) · Rent AED {Number(selectedContract.rent_amount).toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>Owner Profile</label>
                  <select style={inputStyle} value={formData.owner_id} onChange={e => setFormData({ ...formData, owner_id: e.target.value })} required>
                    <option value="">Select owner</option>
                    {owners.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Vacant Date</label>
                    <input type="date" style={inputStyle} value={formData.vacant_date} onChange={e => setFormData({ ...formData, vacant_date: e.target.value })} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Initial Status</label>
                    <select style={inputStyle} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed (vacates immediately)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Dues (AED)</label>
                    <input type="number" style={inputStyle} value={formData.dues} onChange={e => setFormData({ ...formData, dues: e.target.value })} required min={0} />
                  </div>
                  <div>
                    <label style={labelStyle}>Receivable (AED)</label>
                    <input type="number" style={inputStyle} value={formData.receivable} onChange={e => setFormData({ ...formData, receivable: e.target.value })} required min={0} />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: THEME.purple, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.on_case} onChange={e => setFormData({ ...formData, on_case: e.target.checked })} />
                  Mark as on case (legal)
                </label>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button type="button" className="gfh-portal-btn" onClick={closeModal} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 0, fontWeight: 700, fontSize: 13.5, padding: '10px 18px', backgroundColor: '#f0fdfa', color: THEME.purple, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={busy} className="gfh-portal-btn" style={ghostBtnStyle}>
                    Save Settlement
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ padding: 12, background: '#faf8ff', border: `1px solid ${THEME.border}`, borderRadius: 0, fontSize: 13, fontWeight: 600, color: THEME.ink }}>
                  Contract GFH-{String(createdSettlement.contract_id).padStart(5, '0')} · Status: {(createdSettlement.status || '').toUpperCase()}
                  <br />
                  Docs: {(createdSettlement.docs || []).length} · Payments: {(createdSettlement.payments || []).length}
                </div>

                <div>
                  <label style={labelStyle}>Upload Settlement Document</label>
                  <input type="file" onChange={e => setDocFile(e.target.files?.[0] || null)} />
                  <button type="button" className="gfh-portal-btn" disabled={!docFile || busy} onClick={uploadDoc} style={{ marginTop: 8, padding: '8px 12px', fontWeight: 700, fontSize: 13, borderRadius: 0, border: `1px solid ${THEME.border}`, background: '#ccfbf1', color: THEME.purple, cursor: 'pointer' }}>
                    Upload Document
                  </button>
                  <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 12.5 }}>
                    {(createdSettlement.docs || []).map(d => <li key={d.id}>{d.file_name}</li>)}
                  </ul>
                </div>

                <form onSubmit={recordPayment} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={labelStyle}>Record Settlement Payment</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <input type="number" style={inputStyle} placeholder="Amount" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} required min={0} />
                    <select style={inputStyle} value={payForm.payment_method} onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })}>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="card">Card</option>
                    </select>
                    <input type="date" style={inputStyle} value={payForm.payment_date} onChange={e => setPayForm({ ...payForm, payment_date: e.target.value })} required />
                  </div>
                  <button type="submit" disabled={busy} className="gfh-portal-btn" style={{ alignSelf: 'flex-start', padding: '8px 12px', fontWeight: 700, fontSize: 13, borderRadius: 0, border: `1px solid ${THEME.border}`, background: '#ccfbf1', color: THEME.purple, cursor: 'pointer' }}>
                    Save Payment
                  </button>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5 }}>
                    {(createdSettlement.payments || []).map(p => (
                      <li key={p.id}>AED {Number(p.amount).toLocaleString()} · {p.payment_method || '—'} · {formatDate(p.payment_date)}</li>
                    ))}
                  </ul>
                </form>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                  {createdSettlement.status !== 'completed' && (
                    <button type="button" disabled={busy} className="gfh-portal-btn" onClick={() => markCompleted(createdSettlement.id)} style={{ padding: '10px 16px', fontWeight: 700, fontSize: 13.5, borderRadius: 0, border: 'none', background: '#059669', color: '#fff', cursor: 'pointer' }}>
                      Mark as Completed
                    </button>
                  )}
                  <button type="button" className="gfh-portal-btn" onClick={closeModal} style={{ padding: '10px 16px', fontWeight: 700, fontSize: 13.5, borderRadius: 0, backgroundColor: '#f0fdfa', color: THEME.purple, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}>
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
