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
          maxWidth: 640,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: '0 20px 50px -12px rgba(6, 56, 44, 0.35)',
          border: '1px solid #CBD5E1',
          overflow: 'hidden',
          fontFamily: "'Poppins', system-ui, sans-serif",
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <style>{`
          .gfh-vacate-input {
            width: 100%;
            padding: 9px 12px;
            border-radius: 8px;
            border: 1px solid #CBD5E1;
            font-size: 13px;
            font-weight: 600;
            color: #0F172A;
            background: #FFFFFF;
            box-sizing: border-box;
            outline: none;
            transition: all 0.15s ease;
          }
          .gfh-vacate-input:focus {
            border-color: #0E5E48 !important;
            box-shadow: 0 0 0 3px rgba(14, 94, 72, 0.15) !important;
          }
          .gfh-btn-confirm-vacate {
            padding: 11px 22px;
            border-radius: 8px;
            border: 1px solid #064E3B;
            background: linear-gradient(135deg, #0E5E48 0%, #064E3B 100%);
            color: #FFFFFF;
            font-weight: 700;
            font-size: 13.5px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 3px 12px rgba(14, 94, 72, 0.28);
            transition: all 0.18s ease;
          }
          .gfh-btn-confirm-vacate:hover:not(:disabled) {
            background: linear-gradient(135deg, #094434 0%, #042B22 100%);
            box-shadow: 0 5px 16px rgba(14, 94, 72, 0.38);
            transform: translateY(-1px);
          }
          .gfh-btn-confirm-vacate:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }
          .gfh-btn-cancel {
            padding: 10px 18px;
            border-radius: 8px;
            border: 1px solid #CBD5E1;
            background: #FFFFFF;
            color: #475569;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .gfh-btn-cancel:hover:not(:disabled) {
            background: #F8FAFC;
            color: #0F172A;
            border-color: #94A3B8;
          }
        `}</style>

        {/* Modal Header — GoFreeHold Executive Theme */}
        <div
          style={{
            background: 'linear-gradient(135deg, #06382C 0%, #0A4D3C 60%, #115E59 100%)',
            padding: '18px 24px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(52, 211, 165, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'rgba(52, 211, 165, 0.16)',
                border: '1px solid rgba(52, 211, 165, 0.35)',
                color: '#34D3A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: 17.5, fontWeight: 800, letterSpacing: '-0.01em', color: '#FFFFFF' }}>
                  End Contract &amp; Vacate Process
                </h2>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(52, 211, 165, 0.18)',
                    color: '#6EE7C4',
                    border: '1px solid rgba(52, 211, 165, 0.3)',
                  }}
                >
                  Step-by-Step
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#A7F3DC', marginTop: 3, fontWeight: 500 }}>
                {propertyName} &bull; Unit {unitNumber} &bull; {tenantName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              width: 32,
              height: 32,
              borderRadius: 8,
              fontSize: 18,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
          >
            &times;
          </button>
        </div>

        {/* Modal Form Body */}
        <form
          onSubmit={handleConfirmVacate}
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {errorMessage && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                borderRadius: 8,
                padding: '12px 14px',
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

          {/* Section 1: Vacant Date Card */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: 10,
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#042B22',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                1. Vacant Date (Unit Release Date) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1E293B' }}>
                Frees unit to Available
              </span>
            </div>
            <input
              type="date"
              required
              value={vacantDate}
              onChange={(e) => setVacantDate(e.target.value)}
              className="gfh-vacate-input"
              style={{ fontWeight: 700, color: '#0F172A' }}
            />
          </div>

          {/* Section 2: Dues Breakdown Inputs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#0F172A',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                2. Calculate &amp; Record Settlement Amounts (AED)
              </div>
              <span style={{ fontSize: 11.5, color: '#1E293B', fontWeight: 600 }}>
                Incurred dues to be cleared
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Rent Still Due */}
              <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: '#0F172A' }}>
                    Rent Still Due
                  </label>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#0C4A6E', background: '#E0F2FE', padding: '1px 6px', borderRadius: 4 }}>
                    Rent
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={rentDue}
                    onChange={(e) => setRentDue(e.target.value)}
                    className="gfh-vacate-input"
                    style={{ paddingLeft: 46, fontWeight: 700, color: '#0F172A' }}
                  />
                </div>
              </div>

              {/* DEWA / Utilities */}
              <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: '#0F172A' }}>
                    DEWA / Utilities Due
                  </label>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#78350F', background: '#FEF3C7', padding: '1px 6px', borderRadius: 4 }}>
                    Utilities
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={dewaDue}
                    onChange={(e) => setDewaDue(e.target.value)}
                    className="gfh-vacate-input"
                    style={{ paddingLeft: 46, fontWeight: 700, color: '#0F172A' }}
                  />
                </div>
              </div>

              {/* Other Charges / Damages / Maintenance */}
              <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: '#0F172A' }}>
                    Other Charges (Repairs/Damages)
                  </label>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#7F1D1D', background: '#FEE2E2', padding: '1px 6px', borderRadius: 4 }}>
                    Damages
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    className="gfh-vacate-input"
                    style={{ paddingLeft: 46, fontWeight: 700, color: '#0F172A' }}
                  />
                </div>
              </div>

              {/* Admin / Extra Fees */}
              <div style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 800, color: '#0F172A' }}>
                    Admin / Extra Fees
                  </label>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: '#312E81', background: '#E0E7FF', padding: '1px 6px', borderRadius: 4 }}>
                    Admin
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={adminFees}
                    onChange={(e) => setAdminFees(e.target.value)}
                    className="gfh-vacate-input"
                    style={{ paddingLeft: 46, fontWeight: 700, color: '#0F172A' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Deposit / Deductible Credit */}
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #86EFAC',
              borderRadius: 10,
              padding: '12px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, color: '#064E3B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                3. Security Deposit Credit (Deductible Refund)
              </label>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#064E3B', background: '#DCFCE7', padding: '2px 8px', borderRadius: 4, border: '1px solid #86EFAC' }}>
                Credit / Deductible
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                AED
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="gfh-vacate-input"
                style={{ paddingLeft: 46, borderColor: '#86EFAC', fontWeight: 700, color: '#0F172A' }}
              />
            </div>
            <p style={{ margin: '5px 0 0', fontSize: 11.5, color: '#064E3B', fontWeight: 600 }}>
              Holding security deposit will be automatically subtracted from total dues to calculate final net settlement.
            </p>
          </div>

          {/* Section 4: Live Calculated Settlement Summary */}
          <div
            style={{
              background: netBalance > 0 ? '#FEF2F2' : netBalance < 0 ? '#F0FDF4' : '#F8FAFC',
              border: `1px solid ${netBalance > 0 ? '#FCA5A5' : netBalance < 0 ? '#86EFAC' : '#CBD5E1'}`,
              borderRadius: 10,
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>Total Incurred Dues:</span>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                AED {totalDues.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>Security Deposit Credit:</span>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#065F46' }}>
                - AED {numDeposit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 8,
                borderTop: '1px dashed rgba(0,0,0,0.18)',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                {netBalance > 0 ? 'Net Balance Due (Tenant Pays):' : netBalance < 0 ? 'Net Refund to Tenant:' : 'Settlement Net Balance:'}
              </span>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 900,
                  color: netBalance > 0 ? '#991B1B' : netBalance < 0 ? '#065F46' : '#0F172A',
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
                fontWeight: 800,
                color: '#0F172A',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 5,
              }}
            >
              Remarks / Handover Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Key handover notes, unit condition inspection, utility clearance details..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="gfh-vacate-input"
              style={{ resize: 'vertical', fontWeight: 600, color: '#0F172A' }}
            />
          </div>

          {/* Automated System Outcomes notice */}
          <div
            style={{
              fontSize: 12,
              color: '#0F172A',
              background: '#F8FAFC',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            <strong style={{ color: '#064E3B' }}>Workflow Outcome:</strong> On confirmation, this contract will be marked as <strong>vacated</strong>, Unit {unitNumber} will immediately become <strong>AVAILABLE</strong> in your portfolio, and a settlement record will be created for follow-up.
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="gfh-btn-cancel"
              style={{ fontWeight: 700, color: '#0F172A' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="gfh-btn-confirm-vacate"
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Confirm Vacate &amp; Settle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
