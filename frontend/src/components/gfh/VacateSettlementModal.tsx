import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export interface ContractForVacate {
  id: number
  owner_id?: number
  rent_amount?: number | string
  security_deposit?: number | string
  unit_id?: number
  unit?: {
    id: number
    number: string
    property?: {
      id?: number
      name?: string
    }
  }
  tenant?: {
    id: number
    name?: string
    phone?: string
    email?: string
  }
  payments?: Array<{
    amount: number | string
  }>
}

interface VacateSettlementModalProps {
  isOpen: boolean
  onClose: () => void
  contract: ContractForVacate | null
  basePath?: string
  onSuccess?: () => void
}

export default function VacateSettlementModal({
  isOpen,
  onClose,
  contract,
  basePath,
  onSuccess,
}: VacateSettlementModalProps) {
  const navigate = useNavigate()
  const effectiveBasePath = basePath || (
    typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  )
  const apiPrefix = effectiveBasePath

  // Form State
  const [vacantDate, setVacantDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [rentDue, setRentDue] = useState<string>('0')
  const [dewaDue, setDewaDue] = useState<string>('0')
  const [otherCharges, setOtherCharges] = useState<string>('0')
  const [adminFees, setAdminFees] = useState<string>('0')
  const [depositAmount, setDepositAmount] = useState<string>('0')
  const [remarks, setRemarks] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Initialize/prefill defaults when modal opens with contract
  useEffect(() => {
    if (contract && isOpen) {
      setVacantDate(new Date().toISOString().split('T')[0])
      
      // Calculate pending rent from contract value and payments
      const totalRent = Number(contract.rent_amount) || 0
      const totalPaid = (contract.payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
      const pendingRent = Math.max(0, totalRent - totalPaid)
      setRentDue(String(pendingRent))

      setDewaDue('0')
      setOtherCharges('0')
      setAdminFees('0')

      // Security deposit prefill
      const deposit = Number(contract.security_deposit) || 0
      setDepositAmount(String(deposit))

      setRemarks('')
      setErrorMessage(null)
      setIsSubmitting(false)
    }
  }, [contract, isOpen])

  if (!isOpen || !contract) return null

  // Real-time settlement calculations
  const numRentDue = parseFloat(rentDue) || 0
  const numDewaDue = parseFloat(dewaDue) || 0
  const numOtherCharges = parseFloat(otherCharges) || 0
  const numAdminFees = parseFloat(adminFees) || 0
  const numDeposit = parseFloat(depositAmount) || 0

  const totalDues = numRentDue + numDewaDue + numOtherCharges + numAdminFees
  const netBalance = totalDues - numDeposit // > 0: tenant owes money; < 0: refund to tenant

  const handleConfirmVacate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // 1. Calculate final dues & receivable
      const payloadDues = totalDues
      const payloadReceivable = numDeposit

      // If netBalance <= 0 (all dues covered by deposit or zero balance), status is 'completed'
      // If netBalance > 0 (tenant still owes money), status is 'pending' for payment follow-up
      const settlementStatus = netBalance > 0 ? 'pending' : 'completed'

      // Step A: Create settlement record
      await api.post(`${apiPrefix}/settlements`, {
        contract_id: contract.id,
        owner_id: contract.owner_id || undefined,
        vacant_date: vacantDate,
        dues: payloadDues,
        receivable: payloadReceivable,
        status: settlementStatus,
      })

      // Step B: Vacate contract and release unit to AVAILABLE
      const vacateNote = remarks.trim()
        ? `${remarks.trim()} (Vacated on ${vacantDate} • Settlement Created)`
        : `Vacated on ${vacantDate} • Move-out settlement created`

      await api.post(`${apiPrefix}/contracts/${contract.id}/vacate`, {
        notes: vacateNote,
      })

      onClose()
      if (onSuccess) onSuccess()

      // Step C: Take user to settlement screen to complete payment follow-up
      navigate(`${effectiveBasePath}/settlements`, {
        state: {
          message: `Contract GFH-${String(contract.id).padStart(5, '0')} vacated. Unit is now AVAILABLE. Settlement record created for follow-up.`,
        },
      })
    } catch (err: any) {
      console.error('Vacate error:', err)
      setErrorMessage(
        err.response?.data?.message ||
        err.response?.data?.errors?.contract_id?.[0] ||
        'Failed to process vacate & settlement. Please check the inputs and try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const propertyName = contract.unit?.property?.name || 'Property'
  const unitNumber = contract.unit?.number || String(contract.unit?.id || '')
  const tenantName = contract.tenant?.name || 'Tenant'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose()
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          fontFamily: "'Poppins', system-ui, sans-serif",
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            padding: '20px 24px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#FCA5A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', color: '#FFFFFF' }}>
                End Contract &amp; Vacate Process
              </h2>
              <div style={{ fontSize: 12.5, color: '#C7D2FE', marginTop: 2, fontWeight: 500 }}>
                {propertyName} &bull; Unit {unitNumber} &bull; {tenantName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#FFFFFF',
              width: 32,
              height: 32,
              borderRadius: '50%',
              fontSize: 16,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            &times;
          </button>
        </div>

        {/* Modal Form Body */}
        <form
          onSubmit={handleConfirmVacate}
          style={{
            padding: '24px 26px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {errorMessage && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Vacant Date */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginBottom: 6,
              }}
            >
              Vacant Date (When unit becomes empty) <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="date"
              required
              value={vacantDate}
              onChange={(e) => setVacantDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13.5,
                fontWeight: 600,
                color: '#0F172A',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Section 2: Dues Breakdown Inputs */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 10,
              }}
            >
              Settlement Amounts &amp; Dues Calculation (AED)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Rent Still Due */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748B', marginBottom: 5 }}>
                  Rent Still Due
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={rentDue}
                    onChange={(e) => setRentDue(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 40px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#0F172A',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* DEWA / Utilities */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748B', marginBottom: 5 }}>
                  DEWA / Utilities
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={dewaDue}
                    onChange={(e) => setDewaDue(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 40px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#0F172A',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Other Charges / Damages / Maintenance */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748B', marginBottom: 5 }}>
                  Other Charges (Damages / Repairs)
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 40px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#0F172A',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Admin / Extra Fees */}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#64748B', marginBottom: 5 }}>
                  Admin / Extra Fees
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 700, color: '#94A3B8' }}>
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={adminFees}
                    onChange={(e) => setAdminFees(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 40px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#0F172A',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Deposit / Receivable Amount */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              padding: '14px 16px',
            }}
          >
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              Security Deposit / Deductible Refund (AED)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11.5, fontWeight: 700, color: '#64748B' }}>
                AED
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 44px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: '#0F172A',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11.5, color: '#64748B' }}>
              Holding security deposit will be deducted against dues to determine final balance.
            </p>
          </div>

          {/* Section 4: Live Calculated Settlement Summary */}
          <div
            style={{
              background: netBalance > 0 ? '#FEF2F2' : netBalance < 0 ? '#ECFDF5' : '#F1F5F9',
              border: `1px solid ${netBalance > 0 ? '#FECACA' : netBalance < 0 ? '#A7F3DC' : '#E2E8F0'}`,
              borderRadius: 12,
              padding: '16px 18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Total Incurred Dues:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                AED {totalDues.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Security Deposit Credit:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>
                - AED {numDeposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 8,
                borderTop: '1px dashed rgba(0,0,0,0.12)',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                {netBalance > 0 ? 'Net Balance Due (Tenant Pays):' : netBalance < 0 ? 'Net Refund to Tenant:' : 'Settlement Net Balance:'}
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: netBalance > 0 ? '#DC2626' : netBalance < 0 ? '#059669' : '#0F172A',
                }}
              >
                AED {Math.abs(netBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Section 5: Remarks */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginBottom: 6,
              }}
            >
              Remarks / Move-out Inspection Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Key handover notes, unit condition, utility clearance certificate details..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                fontWeight: 500,
                color: '#0F172A',
                boxSizing: 'border-box',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          {/* Automated System Outcomes notice */}
          <div
            style={{
              fontSize: 11.5,
              color: '#64748B',
              background: '#F8FAFC',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #F1F5F9',
              lineHeight: 1.5,
            }}
          >
            <strong>Upon confirming:</strong> The contract will be marked as ended/vacated, Unit {unitNumber} will immediately become <strong>AVAILABLE</strong> in your portfolio, and you will be redirected to the settlement screen for final financial settlement.
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#334155',
                fontWeight: 700,
                fontSize: 13,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 22px',
                borderRadius: 8,
                border: 'none',
                background: '#DC2626',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13.5,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <span>Vacating Contract…</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Confirm Vacate &amp; Record Settlement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
