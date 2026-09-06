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
  purpleDark: '#6B21A8',    // Deep dark purple header/accents
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
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      {/* ─── CARD 1: UNIT & PROPERTY HEADER (Matching Image 2) ──────────── */}
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M9 22v-4h6v4" />
              <line x1="8" y1="6" x2="10" y2="6" />
              <line x1="14" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="10" y2="10" />
              <line x1="14" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="10" y2="14" />
              <line x1="14" y1="14" x2="16" y2="14" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>
              {propertyName}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#065F46', letterSpacing: '-0.01em', marginTop: 2 }}>
              {unitNumber} - {contractTypeLabel}
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin/contracts')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 8,
            background: '#ffffff',
            color: '#1E293B',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back</span>
        </button>
      </div>

      {/* ─── VIEW MODE ─────────────────────────────────────────────────── */}
      {mode === 'view' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* ─── CARD 2: TENANT INFO & ACTION BUTTONS (Matching Image 2) ─── */}
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: '#D1FAE5',
                color: '#065F46',
                fontWeight: 800,
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {contract.tenant?.name
                  ? contract.tenant.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                  : 'TE'}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '0.2px' }}>
                  {contract.tenant?.name || 'Tenant Name'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {contract.tenant?.phone || contract.tenant?.contact || '056-5441856'}
                  </span>
                  <span style={{ color: '#CBD5E1' }}>|</span>
                  <span style={{ color: '#0284C7', display: 'inline-flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* + Add Rent */}
              <button
                onClick={() => openPaymentModal('rent')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                  border: 'none', background: '#065F46', color: '#ffffff', cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(6, 95, 70, 0.2)',
                }}
              >
                <span>+ Add Rent</span>
              </button>

              {/* + Add Dewa */}
              <button
                onClick={() => openPaymentModal('dewa')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                  border: 'none', background: '#0284C7', color: '#ffffff', cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(2, 132, 199, 0.2)',
                }}
              >
                <span>+ Add Dewa</span>
              </button>

              {/* Other Payments */}
              <button
                onClick={() => openPaymentModal('other')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                  border: 'none', background: '#475569', color: '#ffffff', cursor: 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <span>Other Payments</span>
              </button>

              {/* Vacate */}
              <button
                onClick={() => setVacateModalOpen(true)}
                disabled={contract.status !== 'active'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                  border: 'none', background: '#EF4444', color: '#ffffff',
                  cursor: contract.status === 'active' ? 'pointer' : 'not-allowed',
                  opacity: contract.status === 'active' ? 1 : 0.5,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Vacate</span>
              </button>
            </div>
          </div>

          {/* ─── TWO-COLUMN GRID: RECENT PAYMENTS + CONTRACT DETAILS ───────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20 }}>

            {/* Left Column: Recent Payments Table (Matching Image 2) */}
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #E2E8F0',
              padding: '22px 24px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Recent Payments
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Payment Date</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Description</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Amount</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Pay Mode</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Remarks</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!contract.payments || contract.payments.length === 0) ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px 16px', color: '#64748B', fontSize: 13.5, fontWeight: 500 }}>
                          <div>No recent payment records found for this contract.</div>
                          <button
                            onClick={() => openPaymentModal('rent')}
                            style={{
                              marginTop: 10, padding: '7px 16px', fontSize: 12, fontWeight: 700,
                              borderRadius: 8, background: '#065F46', color: '#ffffff', border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            + Record First Payment
                          </button>
                        </td>
                      </tr>
                    ) : (
                      contract.payments.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px', fontWeight: 600, fontSize: 13, color: '#334155' }}>
                            {formatDate(p.date)}
                          </td>
                          <td style={{ padding: '14px', fontWeight: 800, fontSize: 12.5, color: '#0F172A', textTransform: 'uppercase' }}>
                            {p.type}
                          </td>
                          <td style={{ padding: '14px', fontWeight: 700, fontSize: 13.5, color: '#0F172A' }}>
                            {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '14px', fontWeight: 600, fontSize: 12, color: '#334155', textTransform: 'uppercase' }}>
                            {p.mode}
                          </td>
                          <td style={{ padding: '14px', color: '#64748B', fontSize: 12.5 }}>
                            {p.remarks || '—'}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeletePayment(p.id)}
                              title="Delete Payment"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                border: '1px solid #E2E8F0',
                                background: '#FFFFFF',
                                color: '#64748B',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#DC2626'
                                e.currentTarget.style.color = '#DC2626'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#E2E8F0'
                                e.currentTarget.style.color = '#64748B'
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2"/>
                                <circle cx="12" cy="12" r="2"/>
                                <circle cx="12" cy="19" r="2"/>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Contract Details Sidebar (Matching Image 2) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                padding: '22px 24px',
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Contract Details
                  </h3>
                  <button
                    onClick={() => setMode('edit')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: 'transparent', border: 'none', color: '#059669',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span>Edit</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Lease Term</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{contract.lease_term || 'Monthly'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Rent Amount</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{Number(contract.rent_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Security Deposit</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{Number(contract.security_deposit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Dewa Deposit</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{Number(contract.dewa_deposit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Start Date</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{formatDate(contract.start_date)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>End Date</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{formatDate(contract.end_date)}</strong>
                  </div>

                  {/* Dewa Due Box (Matching Image 2) */}
                  <div style={{
                    background: '#FEF2F2',
                    borderRadius: 10,
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                  }}>
                    <span style={{ color: '#DC2626', fontWeight: 800, fontSize: 13.5 }}>Dewa Due</span>
                    <span style={{ color: '#DC2626', fontWeight: 800, fontSize: 14 }}>AED 0.00</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons below sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {contract.status === 'active' && (
                  <button
                    onClick={() => {
                      setRenewData({ new_end_date: '', new_rent_amount: String(contract.rent_amount) })
                      setRenewModalOpen(true)
                    }}
                    style={{
                      width: '100%', padding: '10px 14px', fontSize: 13, fontWeight: 700,
                      borderRadius: 8, background: '#065F46', color: '#ffffff', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Renew Contract
                  </button>
                )}

                <button
                  onClick={downloadPdf}
                  disabled={pdfLoading}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 13, fontWeight: 700,
                    borderRadius: 8, background: '#FFFFFF', color: '#0284C7', border: '1px solid #BAE6FD', cursor: 'pointer',
                  }}
                >
                  {pdfLoading ? 'Downloading PDF...' : 'Download Contract PDF'}
                </button>

                <button
                  onClick={() => setCallLogModalOpen(true)}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 13, fontWeight: 700,
                    borderRadius: 8, background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', cursor: 'pointer',
                  }}
                >
                  + Add Call Log
                </button>
              </div>
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
                  borderRadius: '8px 8px 0 0',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '3px solid #065F46' : '3px solid transparent',
                  background: activeTab === tab.key ? '#ECFDF5' : 'transparent',
                  color: activeTab === tab.key ? '#065F46' : THEME.textMuted,
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
                <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#065F46', marginBottom: 10, letterSpacing: '0.5px' }}>
                  1. Tenant Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Name</label>
                    <input
                      type="text"
                      value={editForm.tenant_name}
                      onChange={e => setEditForm({ ...editForm, tenant_name: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Address</label>
                    <input
                      type="text"
                      value={editForm.tenant_address}
                      onChange={e => setEditForm({ ...editForm, tenant_address: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Contact No.</label>
                    <input
                      type="text"
                      value={editForm.tenant_contact}
                      onChange={e => setEditForm({ ...editForm, tenant_contact: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Email</label>
                    <input
                      type="email"
                      value={editForm.tenant_email}
                      onChange={e => setEditForm({ ...editForm, tenant_email: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Lease & Rent Section */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#065F46', marginBottom: 10, letterSpacing: '0.5px' }}>
                  2. Lease &amp; Rent Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Lease Term</label>
                    <select
                      value={editForm.lease_term}
                      onChange={e => setEditForm({ ...editForm, lease_term: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
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
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Start Date</label>
                    <input
                      type="date"
                      value={editForm.start_date}
                      onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>End Date</label>
                    <input
                      type="date"
                      value={editForm.end_date}
                      onChange={e => setEditForm({ ...editForm, end_date: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Due Date</label>
                    <input
                      type="date"
                      value={editForm.due_date}
                      onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Deposits Section */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#065F46', marginBottom: 10, letterSpacing: '0.5px' }}>
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
                        style={{ flex: 1, padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                      />
                      <button type="button" onClick={downloadPdf} style={{ padding: '0 12px', fontSize: 11, fontWeight: 700, border: `1px solid ${THEME.border}`, background: '#f8fafc', color: THEME.ink, cursor: 'pointer', borderRadius: 8 }}>
                        Print
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Deposit Type</label>
                    <select
                      value={editForm.deposit_type}
                      onChange={e => setEditForm({ ...editForm, deposit_type: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
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
                        style={{ flex: 1, padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                      />
                      <button type="button" onClick={downloadPdf} style={{ padding: '0 12px', fontSize: 11, fontWeight: 700, border: `1px solid ${THEME.border}`, background: '#f8fafc', color: THEME.ink, cursor: 'pointer', borderRadius: 8 }}>
                        Print
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Cheque Details Section */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#065F46', marginBottom: 10, letterSpacing: '0.5px' }}>
                  4. Add Cheque Details (PDC)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Cheque Date</label>
                    <input
                      type="date"
                      value={editForm.cheque_date}
                      onChange={e => setEditForm({ ...editForm, cheque_date: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Cheque No.</label>
                    <input
                      type="text"
                      placeholder="CHQ-10029"
                      value={editForm.cheque_number}
                      onChange={e => setEditForm({ ...editForm, cheque_number: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, display: 'block', marginBottom: 4, color: THEME.ink }}>Bank</label>
                    <select
                      value={editForm.cheque_bank}
                      onChange={e => setEditForm({ ...editForm, cheque_bank: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
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
                      style={{ width: '100%', padding: '8px 10px', fontSize: 13, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
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
                  borderRadius: 8,
                  background: '#065F46',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Submit → Save Contract
              </button>
            </form>
          )}

          {/* CHARGES TAB */}
          {activeTab === 'charges' && (
            <div style={{ ...panelStyle, margin: 0 }}>
              <CornerBrackets />
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#065F46', marginBottom: 14, textTransform: 'uppercase' }}>
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
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#065F46', marginBottom: 14, textTransform: 'uppercase' }}>
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
          <div style={{ background: '#fff', padding: 28, width: 420, borderRadius: 16, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.25)' }}>
            <h3 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: 17, fontWeight: 800 }}>Renew Contract</h3>
            <form onSubmit={handleRenewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>New End Date</label>
                <input type="date" required value={renewData.new_end_date} onChange={e => setRenewData({ ...renewData, new_end_date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>New Rent Amount (AED)</label>
                <input type="number" value={renewData.new_rent_amount} onChange={e => setRenewData({ ...renewData, new_rent_amount: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setRenewModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 8, background: '#065f46', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Confirm Renew</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VACATE MODAL */}
      {vacateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 28, width: 420, borderRadius: 16, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.25)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: 17, fontWeight: 800 }}>Vacate Contract</h3>
            <p style={{ fontSize: 13, color: '#334155', fontWeight: 600, marginBottom: 14 }}>This will vacate the contract and set unit back to AVAILABLE.</p>
            <form onSubmit={handleVacateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <textarea placeholder="Reason / notes..." value={vacateNote} onChange={e => setVacateNote(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setVacateModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 8, background: '#991b1b', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Confirm Vacate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PAYMENT MODAL */}
      {paymentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 28, width: 460, borderRadius: 16, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.25)' }}>
            <h3 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: 17, fontWeight: 800 }}>Add Payment / Charge</h3>
            <form onSubmit={handleAddPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Amount (AED)</label>
                <input type="number" required value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Type</label>
                  <select value={newPayment.type} onChange={e => setNewPayment({ ...newPayment, type: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }}>
                    <option value="rent">Rent</option>
                    <option value="deposit">Deposit</option>
                    <option value="dewa">DEWA</option>
                    <option value="service_charge">Service Charge</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Mode</label>
                  <select value={newPayment.mode} onChange={e => setNewPayment({ ...newPayment, mode: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }}>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Date</label>
                <input type="date" required value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Remarks</label>
                <input type="text" placeholder="Remarks..." value={newPayment.remarks} onChange={e => setNewPayment({ ...newPayment, remarks: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setPaymentModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 8, background: '#065f46', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CALL LOG MODAL */}
      {callLogModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 28, width: 440, borderRadius: 16, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.25)' }}>
            <h3 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: 17, fontWeight: 800 }}>Add Call Log</h3>
            <form onSubmit={handleCallLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Call Date</label>
                <input type="date" required value={callLogData.call_date} onChange={e => setCallLogData({ ...callLogData, call_date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Notes</label>
                <textarea required rows={3} placeholder="Discussion notes..." value={callLogData.notes} onChange={e => setCallLogData({ ...callLogData, notes: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setCallLogModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 8, background: '#075985', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
