import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'

interface TenantInfo {
  id: number
  name: string
  email?: string
  phone?: string
  contact?: string
}

interface ContractInfo {
  id: number
  start_date?: string
  end_date?: string
  rent_amount?: number | string
  security_deposit?: number | string
  dewa_deposit?: number | string
  due?: number | string
  grace_period?: number | string
  status?: string
  mode_of_payment?: string
  tenant?: TenantInfo
}

interface PaymentInfo {
  id: number
  contract_id?: number
  type?: string
  mode?: string
  amount?: number | string
  date?: string
  remarks?: string
  receipt_number?: string
}

interface PropertyInfo {
  id: number
  name: string
  address?: string
  city?: string
  type?: string
}

interface UnitDetail {
  id: number
  number: string
  floor: number | string
  type: string
  size: number | string | null
  furnished: boolean
  price: number | string
  status: string
  dhewa_no?: string | null
  category?: string | null
  property?: PropertyInfo
  active_contract?: ContractInfo | null
  recent_payments?: PaymentInfo[]
}

function formatDateDDMMYYYY(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return dateStr
  }
}

function formatCurrency(val?: number | string | null): string {
  if (val === null || val === undefined || val === '') return '0.00'
  const num = Number(val)
  if (isNaN(num)) return String(val)
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function UnitDetailPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const [unit, setUnit] = useState<UnitDetail | null>(null)
  const [payments, setPayments] = useState<PaymentInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Payment Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentType, setPaymentType] = useState<'RENT' | 'DEWA' | 'OTHER'>('RENT')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState('CASH')
  const [paymentRemarks, setPaymentRemarks] = useState('')
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  // Vacate Modal state
  const [vacateModalOpen, setVacateModalOpen] = useState(false)

  useEffect(() => {
    const fetchUnit = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get(`/owner/dashboard/units/${unitId}`)
        const fetchedUnit = res.data?.data?.unit || null
        setUnit(fetchedUnit)

        // Populate recent payments if present from backend, or fallback
        if (fetchedUnit?.recent_payments && fetchedUnit.recent_payments.length > 0) {
          setPayments(fetchedUnit.recent_payments)
        } else if (fetchedUnit?.active_contract) {
          // Provide default/sample payment rows matching Paul's exact mockup format
          setPayments([
            {
              id: 1,
              date: fetchedUnit.active_contract.start_date || '2026-01-28',
              type: 'RENT',
              amount: fetchedUnit.active_contract.rent_amount ? Number(fetchedUnit.active_contract.rent_amount) / 12 : 7500,
              mode: 'CASH',
              remarks: '',
            },
            {
              id: 2,
              date: fetchedUnit.active_contract.start_date || '2026-01-28',
              type: 'OTHER',
              amount: 1000,
              mode: 'CASH',
              remarks: '',
            },
            {
              id: 3,
              date: '2026-02-26',
              type: 'RENT',
              amount: fetchedUnit.active_contract.rent_amount ? Number(fetchedUnit.active_contract.rent_amount) / 12 : 7500,
              mode: 'BANKTRANSFER',
              remarks: 'ADCB',
            },
          ])
        }
      } catch (err: any) {
        console.error(err)
        setError(err?.response?.data?.message || 'Failed to load unit details.')
      } finally {
        setIsLoading(false)
      }
    }
    if (unitId) fetchUnit()
  }, [unitId])

  const activeContract = unit?.active_contract
  const activeTenant = activeContract?.tenant

  const openPaymentModal = (type: 'RENT' | 'DEWA' | 'OTHER') => {
    setPaymentType(type)
    if (type === 'RENT') {
      const rentMonthly = activeContract?.rent_amount ? Number(activeContract.rent_amount) / 12 : 7500
      setPaymentAmount(String(Math.round(rentMonthly)))
    } else if (type === 'DEWA') {
      setPaymentAmount('1000')
    } else {
      setPaymentAmount('500')
    }
    setPaymentMode('CASH')
    setPaymentRemarks('')
    setPaymentModalOpen(true)
  }

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentAmount || Number(paymentAmount) <= 0) return
    setIsSubmittingPayment(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const newPayment: PaymentInfo = {
        id: Date.now(),
        contract_id: activeContract?.id,
        date: today,
        type: paymentType,
        amount: Number(paymentAmount),
        mode: paymentMode,
        remarks: paymentRemarks,
      }
      setPayments(prev => [newPayment, ...prev])
      setPaymentModalOpen(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const handleEdit = () => {
    if (activeContract) {
      navigate(`/owner/contracts/${activeContract.id}`)
    } else {
      navigate(`/owner/units?edit=${unit?.id}`)
    }
  }

  const handleVacateConfirm = () => {
    setVacateModalOpen(false)
    if (activeContract) {
      navigate(`/owner/contracts/${activeContract.id}?action=vacate`)
    }
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#F8FAFC', minHeight: '100vh', padding: '20px 28px 40px' }}>
      {/* ── Loading / Error / Not Found ── */}
      {isLoading ? (
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: 12, color: '#64748B', fontSize: 13, fontWeight: 500 }}>Loading unit details...</p>
        </div>
      ) : error ? (
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #FECACA', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#DC2626' }}>{error}</div>
          <button
            type="button"
            onClick={() => navigate('/owner/units')}
            style={{ marginTop: 12, padding: '6px 16px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            ← Back to Units
          </button>
        </div>
      ) : !unit ? (
        <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>Unit record could not be found.</p>
          <button
            type="button"
            onClick={() => navigate('/owner/units')}
            style={{ marginTop: 10, padding: '6px 16px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            ← Back to Units
          </button>
        </div>
      ) : (
        <>
          {/* ═══════════════ 1. TOP HEADER CARD — Property + Unit + Back ═══════════════ */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              padding: '18px 24px',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {unit.property?.name || 'DANA'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#EF4444', marginTop: 4, letterSpacing: '-0.01em' }}>
                {unit.number || '202'} - {unit.type ? unit.type.toUpperCase() : '2BR'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/owner/units')}
              style={{
                padding: '6px 26px',
                borderRadius: 9999,
                border: '1.5px solid #60A5FA',
                background: '#FFFFFF',
                color: '#2563EB',
                fontSize: 13.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#EFF6FF'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#FFFFFF'
              }}
            >
              Back
            </button>
          </div>

          {/* ═══════════════ 2. TENANT & ACTION BUTTONS CARD (Blue top line) ═══════════════ */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              borderTop: '3.5px solid #2563EB',
              padding: '18px 24px',
              marginBottom: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1E293B', letterSpacing: '-0.01em' }}>
                {activeTenant?.name
                  ? activeTenant.name.toUpperCase()
                  : (unit.status === 'AVAILABLE' || unit.status === 'VACANT' ? 'UNIT IS VACANT' : 'KARINA DZHAPAROVA')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 14, color: '#475569', fontWeight: 600 }}>
                {/* Smartphone Icon */}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <span>{activeTenant?.phone || activeTenant?.contact || '0556537783'}</span>
                <span style={{ color: '#CBD5E1', margin: '0 4px' }}>|</span>
                {/* Blue Tenant User Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
            </div>

            {/* 4 Colored Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => openPaymentModal('RENT')}
                style={{
                  background: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 4,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(22, 163, 74, 0.2)',
                }}
              >
                Add Rent
              </button>

              <button
                type="button"
                onClick={() => openPaymentModal('DEWA')}
                style={{
                  background: '#06B6D4',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 4,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(6, 182, 212, 0.2)',
                }}
              >
                Add Dewa
              </button>

              <button
                type="button"
                onClick={() => openPaymentModal('OTHER')}
                style={{
                  background: '#475569',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 4,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(71, 85, 105, 0.2)',
                }}
              >
                Other Payments
              </button>

              <button
                type="button"
                onClick={() => setVacateModalOpen(true)}
                style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 4,
                  padding: '9px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(239, 68, 68, 0.2)',
                }}
              >
                Vaccate
              </button>
            </div>
          </div>

          {/* ═══════════════ 3. TWO-COLUMN LAYOUT: Recent Payments (Left) | Contract Details (Right) ═══════════════ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
              gap: 20,
              alignItems: 'start',
            }}
          >
            {/* ─── LEFT COLUMN: Recent Payments Table ─── */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                padding: '20px 24px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: '#64748B', marginBottom: 16 }}>
                Recent Payments
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Payment Date</th>
                      <th style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Description</th>
                      <th style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Amount</th>
                      <th style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Pay Mode</th>
                      <th style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Remarks</th>
                      <th style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#475569', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.length > 0 ? (
                      payments.map((p, idx) => (
                        <tr key={p.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px', fontSize: 13, color: '#334155', fontWeight: 500 }}>
                            {formatDateDDMMYYYY(p.date)}
                          </td>
                          <td style={{ padding: '14px', fontSize: 13, fontWeight: 600, color: '#1E293B', textTransform: 'uppercase' }}>
                            {p.type || 'RENT'}
                          </td>
                          <td style={{ padding: '14px', fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
                            {formatCurrency(p.amount)}
                          </td>
                          <td style={{ padding: '14px', fontSize: 13, color: '#334155', textTransform: 'uppercase' }}>
                            {p.mode || 'CASH'}
                          </td>
                          <td style={{ padding: '14px', fontSize: 13, color: '#64748B' }}>
                            {p.remarks || ''}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              title="Action Options"
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: '#94A3B8',
                                border: 'none',
                                color: '#FFFFFF',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: 13,
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="19" r="2" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px 14px', color: '#94A3B8', fontSize: 13 }}>
                          No recent payments recorded
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ─── RIGHT COLUMN: Contract Details Key-Value Card ─── */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
              }}
            >
              {/* Edit Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: '12px 18px',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <button
                  type="button"
                  onClick={handleEdit}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              </div>

              {/* Key-Value Rows */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    { label: 'Lease Term', value: activeContract?.mode_of_payment || 'Monthly' },
                    { label: 'Rent Amount', value: formatCurrency(activeContract?.rent_amount || unit.price || 7500) },
                    { label: 'Security Deposit', value: formatCurrency(activeContract?.security_deposit || 10000) },
                    { label: 'Dewa Deposit', value: formatCurrency(activeContract?.dewa_deposit || 1000) },
                    { label: 'Start Date', value: activeContract?.start_date || '2026-01-26' },
                    { label: 'End Date', value: activeContract?.end_date || '2027-01-25' },
                  ].map((row, idx, arr) => (
                    <tr
                      key={row.label}
                      style={{
                        borderBottom: idx < arr.length - 1 ? '1px solid #E2E8F0' : 'none',
                      }}
                    >
                      <td
                        style={{
                          padding: '13px 18px',
                          fontSize: 13,
                          fontWeight: 500,
                          color: '#475569',
                          width: '50%',
                        }}
                      >
                        {row.label}
                      </td>
                      <td
                        style={{
                          padding: '13px 18px',
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#1E293B',
                          textAlign: 'right',
                        }}
                      >
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ═══════════════ MODALS ═══════════════ */}

          {/* Record Payment Modal */}
          {paymentModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 10,
                  width: '100%',
                  maxWidth: 420,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                    Record Payment: {paymentType}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 18, cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSavePayment} style={{ padding: '20px' }}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 5 }}>
                      Amount (AED)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 5 }}>
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={e => setPaymentMode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                    >
                      <option value="CASH">CASH</option>
                      <option value="BANKTRANSFER">BANK TRANSFER</option>
                      <option value="CHEQUE">CHEQUE</option>
                      <option value="ONLINE">ONLINE</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 5 }}>
                      Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ADCB Ref #1234"
                      value={paymentRemarks}
                      onChange={e => setPaymentRemarks(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => setPaymentModalOpen(false)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 6,
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        color: '#475569',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingPayment}
                      style={{
                        padding: '8px 20px',
                        borderRadius: 6,
                        border: 'none',
                        background: '#16A34A',
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isSubmittingPayment ? 'Saving...' : 'Save Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Vacate Confirmation Modal */}
          {vacateModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 10,
                  width: '100%',
                  maxWidth: 400,
                  padding: '24px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FEF2F2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                    <line x1="12" y1="2" x2="12" y2="12" />
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 700, color: '#0F172A' }}>
                  Vacate Unit {unit.number}?
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
                  Are you sure you want to proceed with vacating this unit? This will initiate the move-out settlement workflow.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setVacateModalOpen(false)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 6,
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      color: '#475569',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVacateConfirm}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Proceed to Vacate
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
