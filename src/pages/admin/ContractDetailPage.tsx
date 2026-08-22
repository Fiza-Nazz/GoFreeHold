import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface ContractDetail {
  id: number
  unit_id: number
  tenant_id: number
  owner_id: number
  start_date: string
  end_date: string
  due_date?: string
  rent_amount: number
  security_deposit: number
  dewa_deposit?: number
  deposit_type?: string
  lease_term?: string
  status: string
  type: string
  notes?: string
  on_case?: boolean
  last_renewed_at?: string | null
  mode_of_payment?: string
  contract_value?: number
  discount_type?: string
  discount_info?: string
  unit?: { id: number; number: string; property?: { name: string } }
  tenant?: { id: number; name: string; email: string; phone?: string; contact?: string; address?: string }
  owner?: { id: number; name: string; email?: string }
  cheques?: Array<{ id: number; cheque_number: string; bank_name: string; amount: number; due_date: string; status: string }>
  callLogs?: Array<{ id: number; call_date: string; notes: string; outcome?: string }>
  payments?: Array<{ id: number; date: string; amount: number; mode: string; type: string; remarks?: string }>
}

// Deep Professional Dark Color Palette
const DARK_COLORS = {
  emeraldDark: '#065f46',   // Deep green for Renew / Positive
  navyDark: '#075985',      // Deep navy blue for PDF / Secondary
  cyanDark: '#0e7490',      // Deep cyan for Legal case
  crimsonDark: '#991b1b',   // Deep dark red for Vacate / Dues
  purpleDark: '#1e1b4b',    // Deep dark purple header/accents
  slateDark: '#1e293b',     // Deep slate card headers
}

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [contract, setContract] = useState<ContractDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [activeTab, setActiveTab] = useState<'lease' | 'charges' | 'statement'>('lease')
  const [pdfLoading, setPdfLoading] = useState(false)

  // Modals & Action States
  const [renewModalOpen, setRenewModalOpen] = useState(false)
  const [renewData, setRenewData] = useState({ new_end_date: '', new_rent_amount: '' })

  const [vacateModalOpen, setVacateModalOpen] = useState(false)
  const [vacateNote, setVacateNote] = useState('')

  const [callLogModalOpen, setCallLogModalOpen] = useState(false)
  const [callLogData, setCallLogData] = useState({ call_date: new Date().toISOString().split('T')[0], notes: '', outcome: 'follow_up' })

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [newPayment, setNewPayment] = useState({ amount: '', type: 'rent', mode: 'bank_transfer', date: new Date().toISOString().split('T')[0], remarks: '' })

  // Edit Mode Form State
  const [editForm, setEditForm] = useState({
    tenant_name: '',
    tenant_address: '',
    tenant_contact: '',
    tenant_email: '',
    lease_term: '1 Year',
    rent_amount: '',
    start_date: '',
    end_date: '',
    due_date: '',
    security_deposit: '',
    deposit_type: 'Security Deposit',
    dewa_deposit: '',
    // New Cheque
    cheque_date: '',
    cheque_number: '',
    cheque_bank: 'Emirates NBD',
    cheque_amount: '',
  })

  useEffect(() => {
    if (id) fetchContract()
  }, [id])

  const fetchContract = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`/admin/contracts/${id}`)
      const data = res.data?.data?.contract
      setContract(data)
      if (data) {
        setEditForm({
          tenant_name: data.tenant?.name || '',
          tenant_address: data.tenant?.address || '',
          tenant_contact: data.tenant?.phone || data.tenant?.contact || '',
          tenant_email: data.tenant?.email || '',
          lease_term: data.lease_term || '1 Year',
          rent_amount: String(data.rent_amount || ''),
          start_date: data.start_date ? data.start_date.split('T')[0] : '',
          end_date: data.end_date ? data.end_date.split('T')[0] : '',
          due_date: data.due_date ? data.due_date.split('T')[0] : '',
          security_deposit: String(data.security_deposit || ''),
          deposit_type: data.deposit_type || 'Security Deposit',
          dewa_deposit: String(data.dewa_deposit || ''),
          cheque_date: '',
          cheque_number: '',
          cheque_bank: 'Emirates NBD',
          cheque_amount: String(data.rent_amount || ''),
        })
      }
    } catch (err) {
      console.error('Failed to load contract:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPdf = async () => {
    if (!id || pdfLoading) return
    setPdfLoading(true)
    try {
      const response = await api.get(`/admin/contracts/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Tenancy_Contract_GFH_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (err) {
      alert('Error downloading PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleToggleOnCase = async () => {
    if (!contract) return
    try {
      await api.put(`/admin/contracts/${contract.id}/on-case`, { on_case: !contract.on_case })
      fetchContract()
    } catch (err) {
      alert('Failed to update case status')
    }
  }

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    try {
      await api.post(`/admin/contracts/${contract.id}/renew`, renewData)
      setRenewModalOpen(false)
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to renew contract')
    }
  }

  const handleVacateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    try {
      await api.post(`/admin/contracts/${contract.id}/vacate`, { notes: vacateNote })
      setVacateModalOpen(false)
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to vacate contract')
    }
  }

  const handleCallLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    try {
      await api.post(`/admin/call-logs`, { contract_id: contract.id, ...callLogData })
      setCallLogModalOpen(false)
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add call log')
    }
  }

  const handleDeletePayment = async (paymentId: number) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return
    try {
      await api.delete(`/admin/payments/${paymentId}`)
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete payment')
    }
  }

  const openPaymentModal = (type: 'rent' | 'dewa' | 'other' | 'deposit' | 'service_charge' = 'rent') => {
    let defaultAmount = ''
    if (type === 'rent' && contract?.rent_amount) defaultAmount = String(contract.rent_amount)
    if (type === 'dewa' && contract?.dewa_deposit) defaultAmount = String(contract.dewa_deposit)
    setNewPayment({
      amount: defaultAmount,
      type: type,
      mode: 'cash',
      date: new Date().toISOString().split('T')[0],
      remarks: ''
    })
    setPaymentModalOpen(true)
  }

  const handleAddPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    try {
      await api.post(`/admin/payments`, {
        contract_id: contract.id,
        tenant_id: contract.tenant_id,
        ...newPayment
      })
      setPaymentModalOpen(false)
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record payment')
    }
  }

  const handleSaveContractEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    try {
      await api.put(`/admin/contracts/${contract.id}`, {
        rent_amount: editForm.rent_amount,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        due_date: editForm.due_date,
        security_deposit: editForm.security_deposit,
        dewa_deposit: editForm.dewa_deposit,
        deposit_type: editForm.deposit_type,
        lease_term: editForm.lease_term,
      })

      if (editForm.cheque_number && editForm.cheque_date) {
        await api.post(`/admin/contracts/${contract.id}/cheques`, {
          cheque_number: editForm.cheque_number,
          bank_name: editForm.cheque_bank,
          amount: editForm.cheque_amount || editForm.rent_amount,
          due_date: editForm.cheque_date,
          status: 'pending',
        })
      }

      alert('Contract updated successfully!')
      setMode('view')
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update contract')
    }
  }

  if (isLoading) {
    return (
      <div className="gfh-portal-page" style={{ padding: 40, textAlign: 'center' }}>
        <span className="spinner" />
        <p style={{ color: THEME.textMuted, marginTop: 12 }}>Loading Contract Details...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="gfh-portal-page" style={{ padding: 40, textAlign: 'center' }}>
        <h2>Contract Not Found</h2>
        <button onClick={() => navigate('/admin/contracts')} className="gfh-portal-btn" style={ghostBtnStyle}>
          Back to Contracts
        </button>
      </div>
    )
  }

  const propertyName = contract.unit?.property?.name || 'Property'
  const unitNumber = contract.unit?.number || 'Unit'
  const contractTypeLabel = (contract.type || 'Apartment').toUpperCase()
  const balanceDue = Number(contract.rent_amount) - (contract.payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0)

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      {/* ─── PAGE HEADER (Both Modes) ─────────────────────────────────── */}
      <div className="fade-in" style={{ ...heroStyle, marginBottom: 20 }}>
        <CornerBrackets />
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>{propertyName}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: DARK_COLORS.purpleDark, letterSpacing: '0.3px', marginTop: 2 }}>
            {unitNumber} - {contractTypeLabel}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Mode Switch Button */}
          <button
            onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
            className="gfh-portal-btn"
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 0,
              background: mode === 'edit' ? DARK_COLORS.purpleDark : '#ffffff',
              color: mode === 'edit' ? '#ffffff' : DARK_COLORS.purpleDark,
              border: `1px solid ${DARK_COLORS.purpleDark}`,
              cursor: 'pointer'
            }}
          >
            {mode === 'view' ? 'Switch to Edit Mode' : 'Switch to View Mode'}
          </button>

          <button
            onClick={() => navigate('/admin/contracts')}
            className="gfh-portal-btn"
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 0,
              background: '#ffffff',
              color: THEME.ink,
              border: `1px solid ${THEME.border}`,
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </div>
      </div>

      {/* ─── VIEW MODE ─────────────────────────────────────────────────── */}
      {mode === 'view' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Tenant Info Bar */}
          <div style={{
            background: '#ffffff',
            border: `1px solid ${THEME.border}`,
            borderLeft: `4px solid ${DARK_COLORS.purpleDark}`,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 15,
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{contract.tenant?.name || 'Tenant Name'}</div>
              <div style={{ display: 'flex', gap: 20, marginTop: 5, fontSize: 12, color: '#1e293b', fontWeight: 600 }}>
                <span><strong style={{ color: '#0f172a' }}>TEL:</strong> {contract.tenant?.phone || contract.tenant?.contact || 'N/A'}</span>
                <span><strong style={{ color: '#0f172a' }}>EMAIL:</strong> {contract.tenant?.email || 'N/A'}</span>
              </div>
            </div>

            {/* Quick Action Buttons Header (RMS Layout) */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Green: Add Rent */}
              <button
                onClick={() => openPaymentModal('rent')}
                style={{
                  padding: '8px 14px', fontSize: 11, fontWeight: 800, borderRadius: 0,
                  border: 'none', background: '#065f46', color: '#ffffff', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.4px'
                }}
              >
                Add Rent
              </button>

              {/* Cyan: Add Dewa */}
              <button
                onClick={() => openPaymentModal('dewa')}
                style={{
                  padding: '8px 14px', fontSize: 11, fontWeight: 800, borderRadius: 0,
                  border: 'none', background: '#075985', color: '#ffffff', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.4px'
                }}
              >
                Add Dewa
              </button>

              {/* Gray: Other Payments */}
              <button
                onClick={() => openPaymentModal('other')}
                style={{
                  padding: '8px 14px', fontSize: 11, fontWeight: 800, borderRadius: 0,
                  border: 'none', background: '#475569', color: '#ffffff', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.4px'
                }}
              >
                Other Payments
              </button>

              {/* Red: Vacate */}
              <button
                onClick={() => setVacateModalOpen(true)}
                disabled={contract.status !== 'active'}
                style={{
                  padding: '8px 14px', fontSize: 11, fontWeight: 800, borderRadius: 0,
                  border: 'none', background: '#991b1b', color: '#ffffff', cursor: contract.status === 'active' ? 'pointer' : 'not-allowed',
                  opacity: contract.status === 'active' ? 1 : 0.5, textTransform: 'uppercase', letterSpacing: '0.4px'
                }}
              >
                Vacate
              </button>

              {/* Green: Renew */}
              <button
                onClick={() => {
                  setRenewData({ new_end_date: '', new_rent_amount: String(contract.rent_amount) })
                  setRenewModalOpen(true)
                }}
                disabled={contract.status !== 'active'}
                style={{
                  padding: '8px 14px', fontSize: 11, fontWeight: 800, borderRadius: 0,
                  border: 'none', background: '#166534', color: '#ffffff', cursor: contract.status === 'active' ? 'pointer' : 'not-allowed',
                  opacity: contract.status === 'active' ? 1 : 0.5, textTransform: 'uppercase', letterSpacing: '0.4px'
                }}
              >
                Renew Contract
              </button>

              {/* Blue: Generate PDF */}
              <button
                onClick={downloadPdf}
                disabled={pdfLoading}
                style={{
                  padding: '8px 14px', fontSize: 11, fontWeight: 800, borderRadius: 0,
                  border: 'none', background: '#1e1b4b', color: '#ffffff', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.4px'
                }}
              >
                {pdfLoading ? 'Downloading...' : 'Generate PDF'}
              </button>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: 20 }}>

            {/* Left Column: Recent Payments Table (RMS Schema) */}
            <div style={{ ...panelStyle, margin: 0 }}>
              <CornerBrackets />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Recent Payments
                </h3>
                <button
                  onClick={() => openPaymentModal('rent')}
                  style={{
                    padding: '5px 12px', fontSize: 11, fontWeight: 800, borderRadius: 0,
                    background: '#065f46', color: '#ffffff', border: 'none', cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  + Add Payment
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${THEME.border}`, background: '#f8fafc' }}>
                      <th style={thStyle}>Payment Date</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Amount</th>
                      <th style={thStyle}>Pay Mode</th>
                      <th style={thStyle}>Remarks</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!contract.payments || contract.payments.length === 0) ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b', fontSize: 13.5, fontWeight: 600 }}>
                          <div>No recent payment records found for this contract.</div>
                          <button
                            onClick={() => openPaymentModal('rent')}
                            style={{
                              marginTop: 10, padding: '7px 15px', fontSize: 11.5, fontWeight: 800,
                              borderRadius: 0, background: '#075985', color: '#ffffff', border: 'none',
                              cursor: 'pointer', textTransform: 'uppercase'
                            }}
                          >
                            Record First Payment
                          </button>
                        </td>
                      </tr>
                    ) : (
                      contract.payments.map((p) => (
                        <tr key={p.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{formatDate(p.date)}</td>
                          <td style={tdStyle}>
                            <span style={{ textTransform: 'uppercase', fontWeight: 700, color: '#0f172a', fontSize: 12 }}>
                              {p.type}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 800, color: '#065f46' }}>
                            {Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={tdStyle}>
                            <span style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 700, color: '#075985' }}>
                              {p.mode}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, color: '#334155' }}>{p.remarks || '—'}</td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeletePayment(p.id)}
                              title="Delete Payment"
                              style={{
                                padding: '4px 8px', fontSize: 10.5, fontWeight: 700, borderRadius: 0,
                                border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b',
                                cursor: 'pointer', textTransform: 'uppercase'
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Lease Summary Box + Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ ...panelStyle, margin: 0, padding: 18 }}>
                <CornerBrackets />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a' }}>
                    Lease Summary
                  </span>
                  <span style={{
                    padding: '3px 8px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                    background: contract.status === 'active' ? '#f0fdf4' : '#fffbeb',
                    color: contract.status === 'active' ? DARK_COLORS.emeraldDark : '#b45309',
                    border: `1px solid ${contract.status === 'active' ? '#bbf7d0' : '#fde68a'}`
                  }}>
                    {contract.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#1e293b', fontWeight: 700 }}>Lease Term:</span>
                    <strong style={{ color: '#0f172a', fontWeight: 800 }}>{contract.lease_term || '1 Year'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#1e293b', fontWeight: 700 }}>Rent Amount:</span>
                    <strong style={{ color: DARK_COLORS.navyDark, fontWeight: 800 }}>AED {Number(contract.rent_amount).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#1e293b', fontWeight: 700 }}>Security Deposit:</span>
                    <strong style={{ color: '#0f172a', fontWeight: 800 }}>AED {Number(contract.security_deposit).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#1e293b', fontWeight: 700 }}>DEWA Deposit:</span>
                    <strong style={{ color: '#0f172a', fontWeight: 800 }}>AED {Number(contract.dewa_deposit || 0).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#1e293b', fontWeight: 700 }}>Start Date:</span>
                    <strong style={{ color: '#0f172a', fontWeight: 800 }}>{formatDate(contract.start_date)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#1e293b', fontWeight: 700 }}>End Date:</span>
                    <strong style={{ color: '#0f172a', fontWeight: 800 }}>{formatDate(contract.end_date)}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ color: '#991b1b', fontWeight: 800 }}>Dewa Due:</span>
                    <strong style={{ color: '#991b1b', fontWeight: 800, fontSize: 13.5 }}>0.00</strong>
                  </div>

                  <hr style={{ border: 'none', borderTop: `1px solid ${THEME.border}`, margin: '6px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: balanceDue > 0 ? DARK_COLORS.crimsonDark : '#0f172a' }}>Balance Due:</span>
                    <strong style={{ fontSize: 14, fontWeight: 800, color: balanceDue > 0 ? DARK_COLORS.crimsonDark : DARK_COLORS.emeraldDark }}>
                      AED {balanceDue.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Stacked Full-Width Buttons */}
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="gfh-portal-btn"
                style={{
                  width: '100%', padding: '11px 14px', fontSize: 12, fontWeight: 800,
                  borderRadius: 0, background: DARK_COLORS.purpleDark, color: '#ffffff', border: 'none', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.4px'
                }}
              >
                Add Utility Bill / Other Charges
              </button>

              <button
                onClick={() => setCallLogModalOpen(true)}
                className="gfh-portal-btn"
                style={{
                  width: '100%', padding: '11px 14px', fontSize: 12, fontWeight: 800,
                  borderRadius: 0, background: '#075985', color: '#ffffff', border: 'none', cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.4px'
                }}
              >
                Add Call Log
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── EDIT MODE ─────────────────────────────────────────────────── */}
      {mode === 'edit' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Tabs Row */}
          <div style={{ display: 'flex', borderBottom: `2px solid ${THEME.border}`, gap: 4 }}>
            {[
              { key: 'lease', label: 'Lease Details' },
              { key: 'charges', label: 'Charges & Payments' },
              { key: 'statement', label: 'Rent Statement' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '11px 20px',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  borderRadius: 0,
                  border: 'none',
                  borderBottom: activeTab === tab.key ? `3px solid ${DARK_COLORS.purpleDark}` : '3px solid transparent',
                  background: activeTab === tab.key ? '#ffffff' : 'transparent',
                  color: activeTab === tab.key ? DARK_COLORS.purpleDark : THEME.textMuted,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* LEASE TAB FORM */}
          {activeTab === 'lease' && (
            <form onSubmit={handleSaveContractEdit} style={{ ...panelStyle, margin: 0 }}>
              <CornerBrackets />

              {/* 1. Tenant Section */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: DARK_COLORS.purpleDark, marginBottom: 10, letterSpacing: '0.5px' }}>
                  1. Tenant Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Name</label>
                    <input
                      type="text"
                      value={editForm.tenant_name}
                      onChange={e => setEditForm({ ...editForm, tenant_name: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Address</label>
                    <input
                      type="text"
                      value={editForm.tenant_address}
                      onChange={e => setEditForm({ ...editForm, tenant_address: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Contact No.</label>
                    <input
                      type="text"
                      value={editForm.tenant_contact}
                      onChange={e => setEditForm({ ...editForm, tenant_contact: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Email</label>
                    <input
                      type="email"
                      value={editForm.tenant_email}
                      onChange={e => setEditForm({ ...editForm, tenant_email: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Lease & Rent Section */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: DARK_COLORS.purpleDark, marginBottom: 10, letterSpacing: '0.5px' }}>
                  2. Lease &amp; Rent Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Lease Term</label>
                    <select
                      value={editForm.lease_term}
                      onChange={e => setEditForm({ ...editForm, lease_term: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    >
                      <option value="1 Year">1 Year</option>
                      <option value="6 Months">6 Months</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Rent Amount (AED)</label>
                    <input
                      type="number"
                      value={editForm.rent_amount}
                      onChange={e => setEditForm({ ...editForm, rent_amount: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Start Date</label>
                    <input
                      type="date"
                      value={editForm.start_date}
                      onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>End Date</label>
                    <input
                      type="date"
                      value={editForm.end_date}
                      onChange={e => setEditForm({ ...editForm, end_date: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Due Date</label>
                    <input
                      type="date"
                      value={editForm.due_date}
                      onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Deposits Section */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: DARK_COLORS.purpleDark, marginBottom: 10, letterSpacing: '0.5px' }}>
                  3. Deposits &amp; Guarantee
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Rent Deposit (AED)</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="number"
                        value={editForm.security_deposit}
                        onChange={e => setEditForm({ ...editForm, security_deposit: e.target.value })}
                        style={{ flex: 1, padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                      />
                      <button type="button" onClick={downloadPdf} style={{ padding: '0 12px', fontSize: 11, fontWeight: 700, border: `1px solid ${THEME.border}`, background: '#f8fafc', color: THEME.ink, cursor: 'pointer', borderRadius: 0 }}>
                        Print
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Deposit Type</label>
                    <select
                      value={editForm.deposit_type}
                      onChange={e => setEditForm({ ...editForm, deposit_type: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    >
                      <option value="Security Deposit">Security Deposit</option>
                      <option value="Refundable">Refundable</option>
                      <option value="Non-Refundable">Non-Refundable</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>DEWA Deposit (AED)</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="number"
                        value={editForm.dewa_deposit}
                        onChange={e => setEditForm({ ...editForm, dewa_deposit: e.target.value })}
                        style={{ flex: 1, padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                      />
                      <button type="button" onClick={downloadPdf} style={{ padding: '0 12px', fontSize: 11, fontWeight: 700, border: `1px solid ${THEME.border}`, background: '#f8fafc', color: THEME.ink, cursor: 'pointer', borderRadius: 0 }}>
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Cheque Details Section */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: DARK_COLORS.purpleDark, marginBottom: 10, letterSpacing: '0.5px' }}>
                  4. Add Cheque Details (PDC)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Cheque Date</label>
                    <input
                      type="date"
                      value={editForm.cheque_date}
                      onChange={e => setEditForm({ ...editForm, cheque_date: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Cheque No.</label>
                    <input
                      type="text"
                      placeholder="CHQ-10029"
                      value={editForm.cheque_number}
                      onChange={e => setEditForm({ ...editForm, cheque_number: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Bank</label>
                    <select
                      value={editForm.cheque_bank}
                      onChange={e => setEditForm({ ...editForm, cheque_bank: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    >
                      <option value="Emirates NBD">Emirates NBD</option>
                      <option value="ADCB">ADCB</option>
                      <option value="Dubai Islamic Bank">Dubai Islamic Bank</option>
                      <option value="Mashreq Bank">Mashreq Bank</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Cheque Amount (AED)</label>
                    <input
                      type="number"
                      value={editForm.cheque_amount}
                      onChange={e => setEditForm({ ...editForm, cheque_amount: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 0 }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="gfh-portal-btn"
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  fontSize: 13,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderRadius: 0,
                  background: DARK_COLORS.purpleDark,
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Submit &rarr; Save Contract
              </button>
            </form>
          )}

          {/* CHARGES TAB */}
          {activeTab === 'charges' && (
            <div style={{ ...panelStyle, margin: 0 }}>
              <CornerBrackets />
              <h3 style={{ fontSize: 14, fontWeight: 800, color: DARK_COLORS.purpleDark, marginBottom: 14, textTransform: 'uppercase' }}>
                Contract Payments &amp; Charges
              </h3>
              {!contract.payments || contract.payments.length === 0 ? (
                <p style={{ color: THEME.textMuted }}>No charges recorded.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Amount</th>
                      <th style={thStyle}>Mode</th>
                      <th style={thStyle}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.payments.map(p => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={tdStyle}>{formatDate(p.date)}</td>
                        <td style={tdStyle}>{p.type}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>AED {p.amount}</td>
                        <td style={tdStyle}>{p.mode}</td>
                        <td style={tdStyle}>{p.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* STATEMENT TAB */}
          {activeTab === 'statement' && (
            <div style={{ ...panelStyle, margin: 0 }}>
              <CornerBrackets />
              <h3 style={{ fontSize: 14, fontWeight: 800, color: DARK_COLORS.purpleDark, marginBottom: 14, textTransform: 'uppercase' }}>
                Rent Statement Ledger
              </h3>
              <p style={{ color: THEME.textMuted, fontSize: 13, marginBottom: 12 }}>
                Statement of debits and credits for Contract GFH-{String(contract.id).padStart(5, '0')}.
              </p>
              <div style={{ padding: 16, background: '#f8fafc', border: `1px solid ${THEME.border}`, fontSize: 13 }}>
                <strong>Total Rent Contract Amount:</strong> AED {Number(contract.rent_amount).toLocaleString()}<br />
                <strong>Total Received:</strong> AED {(contract.payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0).toLocaleString()}<br />
                <strong>Net Balance:</strong> AED {balanceDue.toLocaleString()}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─── MODALS ─────────────────────────────────────────────────────── */}
      
      {/* RENEW MODAL */}
      {renewModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, width: 400, border: `1px solid ${THEME.border}`, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.3)' }}>
            <CornerBrackets />
            <h3 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: 17, fontWeight: 800, textTransform: 'uppercase' }}>Renew Contract</h3>
            <form onSubmit={handleRenewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>New End Date</label>
                <input type="date" required value={renewData.new_end_date} onChange={e => setRenewData({ ...renewData, new_end_date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 0, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>New Rent Amount (AED)</label>
                <input type="number" value={renewData.new_rent_amount} onChange={e => setRenewData({ ...renewData, new_rent_amount: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 0, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setRenewModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 0, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 0, background: '#065f46', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Confirm Renew</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VACATE MODAL */}
      {vacateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, width: 400, border: `1px solid ${THEME.border}`, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.3)' }}>
            <CornerBrackets color={DARK_COLORS.crimsonDark} />
            <h3 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: 17, fontWeight: 800, textTransform: 'uppercase' }}>Vacate Contract</h3>
            <p style={{ fontSize: 13, color: '#334155', fontWeight: 600, marginBottom: 14 }}>This will vacate the contract and set unit back to AVAILABLE.</p>
            <form onSubmit={handleVacateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <textarea placeholder="Reason / notes..." value={vacateNote} onChange={e => setVacateNote(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 0, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setVacateModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 0, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 0, background: '#991b1b', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Confirm Vacate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PAYMENT MODAL */}
      {paymentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, width: 440, border: `1px solid ${THEME.border}`, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.3)' }}>
            <CornerBrackets />
            <h3 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: 17, fontWeight: 800, textTransform: 'uppercase' }}>Add Payment / Charge</h3>
            <form onSubmit={handleAddPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Amount (AED)</label>
                <input type="number" required value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 0, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Type</label>
                  <select value={newPayment.type} onChange={e => setNewPayment({ ...newPayment, type: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 0, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }}>
                    <option value="rent">Rent</option>
                    <option value="deposit">Deposit</option>
                    <option value="dewa">DEWA</option>
                    <option value="service_charge">Service Charge</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Mode</label>
                  <select value={newPayment.mode} onChange={e => setNewPayment({ ...newPayment, mode: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 0, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }}>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Date</label>
                <input type="date" required value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 0, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Remarks</label>
                <input type="text" placeholder="Remarks..." value={newPayment.remarks} onChange={e => setNewPayment({ ...newPayment, remarks: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 0, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setPaymentModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 0, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 0, background: '#065f46', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CALL LOG MODAL */}
      {callLogModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 24, width: 420, border: `1px solid ${THEME.border}`, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.3)' }}>
            <CornerBrackets />
            <h3 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: 17, fontWeight: 800, textTransform: 'uppercase' }}>Add Call Log</h3>
            <form onSubmit={handleCallLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Call Date</label>
                <input type="date" required value={callLogData.call_date} onChange={e => setCallLogData({ ...callLogData, call_date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 0, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Notes</label>
                <textarea required rows={3} placeholder="Discussion notes..." value={callLogData.notes} onChange={e => setCallLogData({ ...callLogData, notes: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 0, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setCallLogModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 0, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 0, background: '#075985', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
