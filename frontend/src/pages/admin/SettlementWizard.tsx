import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface Settlement {
  id: number
  owner_id: number
  contract_id?: number | null
  vacant_date: string
  dues: number
  receivable: number
  on_case: boolean
  status: string
  notes?: string | null
  remarks?: string | null
  owner?: { id: number; name: string; email?: string }
  contract?: {
    id: number
    status?: string
    unit?: { id: number; number: string; status?: string; property?: { name: string } }
    tenant?: { id: number; name: string }
    notes?: string | null
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
  notes?: string | null
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
  gavel: 'M14 7l3 3M5 16l6-6M8 19l6-6M3 21h18M18 10l-4-4 2-2 4 4-2 2z',
  floppy: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  check: 'M20 6L9 17l-5-5',
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 8,
  color: THEME.ink,
  fontSize: 14,
  fontWeight: 600,
  padding: '10px 12px',
  width: '100%',
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  padding: '16px 18px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
}

const cardHeaderStyle: React.CSSProperties = {
  fontSize: 14.5,
  fontWeight: 600,
  color: '#334155',
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: 8,
  marginBottom: 14,
}

const panelBtnStyle: React.CSSProperties = {
  padding: '6px 18px',
  fontSize: 13,
  fontWeight: 600,
  borderRadius: 4,
  border: '1px solid #cbd5e1',
  background: '#f8fafc',
  color: '#1e293b',
  cursor: 'pointer',
}

const panelInputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: 4,
  fontSize: 13,
  color: '#0f172a',
  padding: '6px 10px',
  outline: 'none',
  width: '100%',
  maxWidth: 280,
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
  const location = useLocation()
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [activeContracts, setActiveContracts] = useState<ActiveContract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(emptyForm())
  const [createdSettlement, setCreatedSettlement] = useState<Settlement | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [payForm, setPayForm] = useState({ amount: '0.00', payment_method: 'Cash', payment_date: new Date().toISOString().split('T')[0] })
  const [settlementRemarks, setSettlementRemarks] = useState<string>('')
  const [settlementStatus, setSettlementStatus] = useState<string>('completed')
  const [caseStatus, setCaseStatus] = useState<string>('no_case')
  const [caseRemarks, setCaseRemarks] = useState<string>('')
  const [actionSuccess, setActionSuccess] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message)
    }
  }, [location.state])

  useEffect(() => {
    fetchSettlements()
    fetchOwners()
    fetchActiveContracts()
  }, [basePath])

  useEffect(() => {
    if (location.state?.settlementId && settlements.length > 0) {
      const target = settlements.find(s => s.id === Number(location.state.settlementId))
      if (target) {
        openManageModal(target)
      }
    }
  }, [location.state, settlements])

  const fetchOwners = async () => {
    try {
      const res = await api.get(`${basePath}/properties/owners`)
      setOwners(res.data?.data?.owner_profiles || [])
    } catch (err) { console.error(err) }
  }

  const fetchActiveContracts = async () => {
    try {
      const res = await api.get(`${basePath}/contracts`)
      const all = res.data?.data?.contracts || []
      setActiveContracts(all.filter((c: ActiveContract) => c.status === 'active'))
    } catch (err) { console.error(err) }
  }

  const fetchSettlements = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`${basePath}/settlements`)
      setSettlements(res.data?.data?.settlements || [])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const pickContract = (contractId: string) => {
    const c = activeContracts.find(x => String(x.id) === contractId)
    setFormData(prev => ({
      ...prev,
      contract_id: contractId,
      owner_id: c ? String(c.owner_id) : '',
    }))
  }

  const openManageModal = async (s: Settlement) => {
    setBusy(true)
    setActionSuccess('')
    try {
      const res = await api.get(`${basePath}/settlements/${s.id}`)
      const loaded = res.data?.data?.settlement || s
      setCreatedSettlement(loaded)
      setSettlementRemarks(loaded.contract?.notes || '')
      setSettlementStatus(loaded.status === 'completed' ? 'completed' : 'pending')
      setCaseStatus(loaded.on_case ? 'active' : 'no_case')
      setCaseRemarks(loaded.contract?.notes || '')
      setPayForm({ amount: '0.00', payment_method: 'Cash', payment_date: new Date().toISOString().split('T')[0] })
      setDocFile(null)
      setIsModalOpen(true)
    } catch {
      setCreatedSettlement(s)
      setSettlementRemarks(s.contract?.notes || '')
      setSettlementStatus(s.status === 'completed' ? 'completed' : 'pending')
      setCaseStatus(s.on_case ? 'active' : 'no_case')
      setCaseRemarks(s.contract?.notes || '')
      setIsModalOpen(true)
    } finally {
      setBusy(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCreatedSettlement(null)
    setDocFile(null)
    setPayForm({ amount: '0.00', payment_method: 'Cash', payment_date: new Date().toISOString().split('T')[0] })
    setFormData(emptyForm())
    setActionSuccess('')
    fetchSettlements()
    fetchActiveContracts()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const res = await api.post(`${basePath}/settlements`, {
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
      setSettlementRemarks(settlement.contract?.notes || '')
      setSettlementStatus(settlement.status === 'completed' ? 'completed' : 'pending')
      setCaseStatus(settlement.on_case ? 'active' : 'no_case')
      setCaseRemarks(settlement.contract?.notes || '')
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

  const uploadDoc = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!createdSettlement || !docFile) {
      alert('Please choose a file to upload.')
      return
    }
    setBusy(true)
    setActionSuccess('')
    try {
      const body = new FormData()
      body.append('settlement_id', String(createdSettlement.id))
      body.append('file', docFile)
      await api.post(`${basePath}/settlement-docs`, body)
      const show = await api.get(`${basePath}/settlements/${createdSettlement.id}`)
      setCreatedSettlement(show.data.data.settlement)
      setDocFile(null)
      setActionSuccess('Settlement document uploaded successfully.')
      fetchSettlements()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Document upload failed')
    } finally {
      setBusy(false)
    }
  }

  const deleteDoc = async (docId: number) => {
    if (!window.confirm('Delete this settlement document?')) return
    setBusy(true)
    setActionSuccess('')
    try {
      await api.delete(`${basePath}/settlement-docs/${docId}`)
      if (createdSettlement) {
        const show = await api.get(`${basePath}/settlements/${createdSettlement.id}`)
        setCreatedSettlement(show.data.data.settlement)
      }
      setActionSuccess('Document deleted.')
      fetchSettlements()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete document')
    } finally {
      setBusy(false)
    }
  }

  const recordPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!createdSettlement) return
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      alert('Please enter a valid payment amount.')
      return
    }
    setBusy(true)
    setActionSuccess('')
    try {
      await api.post(`${basePath}/settlement-payments`, {
        settlement_id: createdSettlement.id,
        amount: payForm.amount,
        payment_method: payForm.payment_method.toLowerCase(),
        payment_date: payForm.payment_date,
      })
      const show = await api.get(`${basePath}/settlements/${createdSettlement.id}`)
      setCreatedSettlement(show.data.data.settlement)
      setPayForm({ amount: '0.00', payment_method: 'Cash', payment_date: new Date().toISOString().split('T')[0] })
      setActionSuccess('Settlement payment recorded successfully.')
      fetchSettlements()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment failed')
    } finally {
      setBusy(false)
    }
  }

  const deletePayment = async (paymentId: number) => {
    if (!window.confirm('Delete this payment record?')) return
    setBusy(true)
    setActionSuccess('')
    try {
      await api.delete(`${basePath}/settlement-payments/${paymentId}`)
      if (createdSettlement) {
        const show = await api.get(`${basePath}/settlements/${createdSettlement.id}`)
        setCreatedSettlement(show.data.data.settlement)
      }
      setActionSuccess('Payment record deleted.')
      fetchSettlements()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete payment')
    } finally {
      setBusy(false)
    }
  }

  const updateSettlementDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!createdSettlement) return
    setBusy(true)
    setActionSuccess('')
    try {
      await api.put(`${basePath}/settlements/${createdSettlement.id}`, {
        status: settlementStatus,
      })
      if (settlementRemarks && createdSettlement.contract_id) {
        try {
          await api.put(`${basePath}/contracts/${createdSettlement.contract_id}`, {
            notes: settlementRemarks,
          })
        } catch (cErr) {
          console.warn('Contract note update notice:', cErr)
        }
      }
      const show = await api.get(`${basePath}/settlements/${createdSettlement.id}`)
      setCreatedSettlement(show.data.data.settlement)
      setActionSuccess('Settlement details updated successfully.')
      fetchSettlements()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update settlement')
    } finally {
      setBusy(false)
    }
  }

  const updateCaseDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!createdSettlement) return
    setBusy(true)
    setActionSuccess('')
    try {
      const isOnCase = (caseStatus === 'active')
      await api.put(`${basePath}/settlements/${createdSettlement.id}`, {
        on_case: isOnCase,
      })
      if (caseRemarks && createdSettlement.contract_id) {
        try {
          await api.put(`${basePath}/contracts/${createdSettlement.contract_id}`, {
            notes: caseRemarks,
          })
        } catch (cErr) {
          console.warn('Contract note update notice:', cErr)
        }
      }
      const show = await api.get(`${basePath}/settlements/${createdSettlement.id}`)
      setCreatedSettlement(show.data.data.settlement)
      setActionSuccess('Case details updated successfully.')
      fetchSettlements()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update case details')
    } finally {
      setBusy(false)
    }
  }

  const markCompleted = async (settlementId: number) => {
    setBusy(true)
    try {
      const res = await api.put(`${basePath}/settlements/${settlementId}`, { status: 'completed' })
      const updated = res.data.data.settlement as Settlement
      setMessage(`Settlement #${settlementId} marked completed.`)
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
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
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
                        <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '3px 8px', fontSize: 11, fontWeight: 700, borderRadius: 8 }}>LEGAL CASE ACTIVE</span>
                      ) : (
                        <span style={{ color: THEME.textMuted }}>No</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ backgroundColor: s.status === 'completed' ? '#f0fdf4' : '#fffbeb', color: s.status === 'completed' ? '#065f46' : '#b45309', border: `1px solid ${s.status === 'completed' ? '#bbf7d0' : '#fde68a'}`, padding: '4px 11px', borderRadius: 8, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.3px' }}>
                        {(s.status || '—').toString().toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        type="button"
                        className="gfh-portal-btn"
                        onClick={() => openManageModal(s)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 6, border: '1px solid #075985', background: '#075985', color: '#fff', cursor: 'pointer', marginRight: 6 }}
                      >
                        Update / Details
                      </button>
                      {s.status !== 'completed' && s.contract_id && (
                        <button
                          type="button"
                          className="gfh-portal-btn"
                          disabled={busy}
                          onClick={() => markCompleted(s.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 10px', fontSize: 12, fontWeight: 700, borderRadius: 6, border: 'none', background: '#065f46', color: '#fff', cursor: 'pointer' }}
                        >
                          <Icon path={ICONS.check} size={13} />
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,61,58,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="fade-in" style={{ position: 'relative', width: '100%', maxWidth: 840, padding: 26, maxHeight: '92vh', overflowY: 'auto', background: '#ffffff', borderRadius: 8, border: `1px solid ${THEME.border}`, boxShadow: '0 24px 55px -18px rgba(15,61,58,0.35)' }}>
            <CornerBrackets />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 800, margin: 0, color: THEME.ink }}>
                  {createdSettlement ? `Settlement Management — GFH-${String(createdSettlement.contract_id || createdSettlement.id).padStart(5, '0')}` : 'New Settlement'}
                </h2>
                <p style={{ marginTop: 4, marginBottom: 0, fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>
                  {createdSettlement
                    ? `Unit ${createdSettlement.contract?.unit?.number || '—'} · ${createdSettlement.contract?.unit?.property?.name || ''} · Tenant: ${createdSettlement.contract?.tenant?.name || '—'} · Status: ${(createdSettlement.status || 'pending').toUpperCase()}`
                    : 'Select an active contract (unit/tenant). Completing will vacate the contract and set the unit AVAILABLE.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: 'none', border: 'none', fontSize: 22, color: '#94a3b8', cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}
              >
                ✕
              </button>
            </div>

            {actionSuccess && (
              <div style={{ marginBottom: 14, padding: '10px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                {actionSuccess}
              </div>
            )}

            {message && !actionSuccess && (
              <div style={{ marginBottom: 14, padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', color: '#075985', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
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
                  <label style={labelStyle} htmlFor="settlement-owner">Owner Profile</label>
                  <select id="settlement-owner" style={inputStyle} value={formData.owner_id} disabled={!!formData.contract_id} onChange={e => setFormData({ ...formData, owner_id: e.target.value })} required>
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
                  <button type="button" className="gfh-portal-btn" onClick={closeModal} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 8, fontWeight: 700, fontSize: 13.5, padding: '10px 18px', backgroundColor: '#f0fdfa', color: THEME.purple, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={busy} className="gfh-portal-btn" style={ghostBtnStyle}>
                    Save Settlement
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Row 1: Upload Documents & Update Settlement */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
                  {/* Panel 1: Upload Documents */}
                  <div style={cardStyle}>
                    <div style={cardHeaderStyle}>Upload Documents</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 50 }}>Doc</label>
                      <input
                        type="file"
                        onChange={e => setDocFile(e.target.files?.[0] || null)}
                        style={{ fontSize: 13, color: '#334155' }}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={!docFile || busy}
                      onClick={() => uploadDoc()}
                      style={{ ...panelBtnStyle, opacity: !docFile ? 0.6 : 1 }}
                    >
                      Update
                    </button>

                    {/* Uploaded Documents List */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                        Uploaded Documents ({(createdSettlement.docs || []).length})
                      </div>
                      {(!createdSettlement.docs || createdSettlement.docs.length === 0) ? (
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>No documents uploaded yet.</p>
                      ) : (
                        <div style={{ border: '1px solid #f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                            <tbody>
                              {createdSettlement.docs.map(d => (
                                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '6px 10px', color: '#1e293b', fontWeight: 500, wordBreak: 'break-all' }}>
                                    {d.file_name}
                                  </td>
                                  <td style={{ padding: '6px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    <button
                                      type="button"
                                      disabled={busy}
                                      onClick={() => deleteDoc(d.id)}
                                      title="Delete document"
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                                    >
                                      <Icon path={icons.trash} size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Panel 2: Update Settlement */}
                  <div style={cardStyle}>
                    <div style={cardHeaderStyle}>Update Settlement</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 10 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Settlement Remarks</label>
                        <input
                          type="text"
                          value={settlementRemarks}
                          onChange={e => setSettlementRemarks(e.target.value)}
                          placeholder="Remarks..."
                          style={panelInputStyle}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 10 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Status</label>
                        <select
                          value={settlementStatus}
                          onChange={e => setSettlementStatus(e.target.value)}
                          style={panelInputStyle}
                        >
                          <option value="completed">Cleared</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                      <div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => updateSettlementDetails()}
                          style={panelBtnStyle}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Update Payments & Recent Payments */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
                  {/* Panel 3: Update Payments */}
                  <div style={cardStyle}>
                    <div style={cardHeaderStyle}>Update Payments</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 10 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Payment Date</label>
                        <input
                          type="date"
                          value={payForm.payment_date}
                          onChange={e => setPayForm({ ...payForm, payment_date: e.target.value })}
                          style={panelInputStyle}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 10 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={payForm.amount}
                          onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                          style={panelInputStyle}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 10 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Payment Type</label>
                        <select
                          value={payForm.payment_method}
                          onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })}
                          style={panelInputStyle}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Card">Card</option>
                        </select>
                      </div>
                      <div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => recordPayment()}
                          style={panelBtnStyle}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Panel 4: Recent Payments */}
                  <div style={cardStyle}>
                    <div style={cardHeaderStyle}>Recent Payments</div>
                    {(!createdSettlement.payments || createdSettlement.payments.length === 0) ? (
                      <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '8px 0' }}>No recent payments recorded.</p>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                              <th style={{ padding: '7px 8px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Date</th>
                              <th style={{ padding: '7px 8px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Amount</th>
                              <th style={{ padding: '7px 8px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Paymode</th>
                              <th style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {createdSettlement.payments.map(p => (
                              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '7px 8px', color: '#1e293b' }}>
                                  {formatDate(p.payment_date)}
                                </td>
                                <td style={{ padding: '7px 8px', fontWeight: 700, color: '#065f46' }}>
                                  {Number(p.amount).toFixed(2)}
                                </td>
                                <td style={{ padding: '7px 8px', color: '#475569', textTransform: 'capitalize' }}>
                                  {p.payment_method || 'Cash'}
                                </td>
                                <td style={{ padding: '7px 8px', textAlign: 'right' }}>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => deletePayment(p.id)}
                                    title="Delete payment"
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                                  >
                                    <Icon path={icons.trash} size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 3: Case Details (Yellow Header Banner) */}
                <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #fcd34d' }}>
                  {/* Banner */}
                  <div style={{ background: '#f59e0b', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                      <Icon path={icons.gavel} size={18} />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>Case Details</span>
                    </div>
                    <div>
                      {caseStatus === 'active' || createdSettlement.on_case ? (
                        <span style={{ background: '#dc2626', color: '#ffffff', padding: '3px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                          Active Case
                        </span>
                      ) : (
                        <span style={{ background: '#3b82f6', color: '#ffffff', padding: '3px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                          No Active Case
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Form Body */}
                  <div style={{ background: '#ffffff', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'center', gap: 10 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Case Status</label>
                      <select
                        value={caseStatus}
                        onChange={e => setCaseStatus(e.target.value)}
                        style={panelInputStyle}
                      >
                        <option value="no_case">No Case</option>
                        <option value="active">Active Case</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', alignItems: 'flex-start', gap: 10 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', paddingTop: 6 }}>Case Remarks</label>
                      <textarea
                        rows={3}
                        value={caseRemarks}
                        onChange={e => setCaseRemarks(e.target.value)}
                        placeholder="Case remarks..."
                        style={{ ...panelInputStyle, width: '100%', maxWidth: '100%', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateCaseDetails()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#f59e0b',
                          color: '#0f172a',
                          border: '1px solid #d97706',
                          borderRadius: 4,
                          padding: '6px 18px',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                        }}
                      >
                        <Icon path={icons.floppy} size={15} />
                        Update
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                  {createdSettlement.status !== 'completed' && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => markCompleted(createdSettlement.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontWeight: 700, fontSize: 13, borderRadius: 6, border: 'none', background: '#065f46', color: '#fff', cursor: 'pointer' }}
                    >
                      <Icon path={ICONS.check} size={14} />
                      Mark as Completed (Free Unit)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{ padding: '9px 18px', fontWeight: 700, fontSize: 13, borderRadius: 6, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  >
                    Close
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
