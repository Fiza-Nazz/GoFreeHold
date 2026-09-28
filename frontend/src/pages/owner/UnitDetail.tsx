import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { Icon, ICONS, portalPageCss, ghostBtnStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

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
  due?: number | string
  status?: string
  mode_of_payment?: string
  tenant?: TenantInfo
}

interface ComplaintInfo {
  id: number
  title: string
  description?: string
  status: string
  priority: string
  created_at: string
  job?: {
    assignedTo?: {
      id: number
      name: string
    }
  }
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
  monthly_service_charge?: number | string | null
  quarterly_service_charge?: number | string | null
  yearly_service_charge?: number | string | null
  status: string
  dhewa_no?: string | null
  category?: string | null
  property?: PropertyInfo
  active_contract?: ContractInfo | null
  contracts_count?: number
  recent_contracts?: ContractInfo[]
  recent_complaints?: ComplaintInfo[]
}

const LOCAL_ICONS = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
  mapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  layers: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  checkCircle: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function getStatusBadge(status?: string) {
  const s = (status || '').toUpperCase()
  if (s === 'OCCUPIED') {
    return { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', label: 'Occupied' }
  }
  if (s === 'AVAILABLE' || s === 'VACANT') {
    return { bg: '#F0FDF4', color: '#065F46', border: '#BBF7D0', label: 'Available' }
  }
  if (s === 'BOOKED' || s === 'RESERVED') {
    return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Booked' }
  }
  return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: status || '—' }
}

function getContractStatusBadge(status?: string) {
  const s = (status || '').toLowerCase()
  if (s === 'active') {
    return { bg: '#F0FDF4', color: '#065F46', border: '#BBF7D0', label: 'Active' }
  }
  if (s === 'vacated') {
    return { bg: '#F0F9FF', color: '#075985', border: '#BAE6FD', label: 'Vacated' }
  }
  if (s === 'expired') {
    return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: 'Expired' }
  }
  if (s === 'terminated' || s === 'cancelled') {
    return { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', label: 'Terminated' }
  }
  return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: status || '—' }
}

function getPriorityBadge(priority?: string) {
  const p = (priority || '').toLowerCase()
  if (p === 'high' || p === 'urgent') {
    return { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', label: 'High' }
  }
  if (p === 'medium') {
    return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Medium' }
  }
  return { bg: '#F0FDF4', color: '#065F46', border: '#BBF7D0', label: 'Low' }
}

function getComplaintStatusBadge(status?: string) {
  const s = (status || '').toLowerCase()
  if (s === 'resolved' || s === 'completed') {
    return { bg: '#F0FDF4', color: '#065F46', border: '#BBF7D0', label: 'Resolved' }
  }
  if (s === 'in_progress' || s === 'assigned') {
    return { bg: '#F0F9FF', color: '#075985', border: '#BAE6FD', label: s === 'assigned' ? 'Assigned' : 'In Progress' }
  }
  if (s === 'open') {
    return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Open' }
  }
  return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: status || '—' }
}

export default function UnitDetailPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const [unit, setUnit] = useState<UnitDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUnit = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get(`/owner/dashboard/units/${unitId}`)
        setUnit(res.data?.data?.unit || null)
      } catch (err: any) {
        console.error(err)
        setError(err?.response?.data?.message || 'Failed to load unit details.')
      } finally {
        setIsLoading(false)
      }
    }
    if (unitId) fetchUnit()
  }, [unitId])

  const statusBadge = getStatusBadge(unit?.status)
  const activeContract = unit?.active_contract
  const activeTenant = activeContract?.tenant

  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: 10,
    border: '1px solid #E2E8F0',
    padding: '18px 20px',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#F8FAFC', minHeight: '100vh', paddingBottom: 40 }}>
      <style>{`
        ${portalPageCss}
        .unit-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr);
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 1060px) {
          .unit-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ─── 1. CLEAN TOP HEADER CARD ─── */}
      <div
        className="fade-in"
        style={{
          background: '#FFFFFF',
          borderRadius: 10,
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          marginBottom: 14,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        }}
      >
        {/* Top Line: Breadcrumb + Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', fontWeight: 500 }}>
            <Link to="/owner/dashboard" style={{ color: '#065F46', textDecoration: 'none', fontWeight: 600 }}>Portfolio</Link>
            <span>/</span>
            <Link to="/owner/units" style={{ color: '#065F46', textDecoration: 'none', fontWeight: 600 }}>Units</Link>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 700 }}>Unit {unit?.number || unitId}</span>
          </div>

          {unit && (
            <span style={{
              background: statusBadge.bg,
              color: statusBadge.color,
              border: `1px solid ${statusBadge.border}`,
              fontSize: 11.5,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 999,
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}>
              {statusBadge.label}
            </span>
          )}
        </div>

        {/* Main Header Row: Title & Specs (Left) | Action Buttons (Right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.015em' }}>
                Unit #{unit?.number || '—'}
              </h1>
              {unit?.type && (
                <span style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6,
                  textTransform: 'uppercase',
                }}>
                  {unit.type}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
              <span style={{ fontWeight: 600, color: '#1E293B' }}>{unit?.property?.name || 'Property'}</span>
              {unit?.property?.city && <span>• {unit.property.city}</span>}
              {unit?.floor != null && <span>• Floor {unit.floor}</span>}
              {unit?.size && <span>• {Number(unit.size).toLocaleString()} SQFT</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Link
              to="/owner/units"
              className="gfh-portal-btn"
              style={{
                ...ghostBtnStyle,
                background: '#F8FAFC',
                color: '#475569',
                border: '1px solid #CBD5E1',
                padding: '6px 12px',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              ← Back to Units
            </Link>

            {!activeContract && (unit?.status === 'AVAILABLE' || unit?.status === 'VACANT') && (
              <Link
                to={`/owner/contracts?create=1&unit_id=${unit.id}&property_id=${unit.property?.id || ''}`}
                className="gfh-portal-btn"
                style={{
                  ...ghostBtnStyle,
                  background: '#065F46',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                }}
              >
                <Icon path={ICONS.plus} size={14} />
                Create Contract
              </Link>
            )}

            {activeContract && (
              <Link
                to={`/owner/contracts/${activeContract.id}`}
                className="gfh-portal-btn"
                style={{
                  ...ghostBtnStyle,
                  background: '#065F46',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                }}
              >
                <Icon path={ICONS.contracts} size={14} />
                View Active Lease
              </Link>
            )}

            {activeContract && (
              <Link
                to={`/owner/contracts/${activeContract.id}?action=vacate`}
                className="gfh-portal-btn"
                style={{
                  ...ghostBtnStyle,
                  background: '#FEF2F2',
                  color: '#991B1B',
                  border: '1px solid #FECACA',
                  padding: '6px 12px',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
                title="Start vacate and move-out settlement process for this unit"
              >
                <Icon path={ICONS.door} size={14} />
                Vacate Unit
              </Link>
            )}

            <Link
              to="/owner/complaints"
              className="gfh-portal-btn"
              style={{
                ...ghostBtnStyle,
                background: '#F8FAFC',
                color: '#475569',
                border: '1px solid #CBD5E1',
                padding: '6px 12px',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              <Icon path={ICONS.wrench} size={14} />
              Complaints
            </Link>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#065F46', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: 12, color: '#64748B', fontSize: 13, fontWeight: 500 }}>Loading unit details...</p>
        </div>
      ) : error ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#991B1B' }}>{error}</div>
          <Link to="/owner/units" style={{ display: 'inline-block', marginTop: 12, color: '#065F46', fontWeight: 600, fontSize: 13 }}>
            ← Return to Units list
          </Link>
        </div>
      ) : !unit ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>Unit record could not be found.</p>
          <Link to="/owner/units" style={{ display: 'inline-block', marginTop: 10, color: '#065F46', fontWeight: 600, fontSize: 13 }}>
            ← Back to Units
          </Link>
        </div>
      ) : (
        <>
          {/* ─── 2. COMPACT UNIFIED METRICS ROW (Clean White Cards) ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10, marginBottom: 14 }}>
            {/* Card 1: Annual Rent */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Annual Rent
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#065F46', marginTop: 3 }}>
                AED {Number(activeContract?.rent_amount || unit.price || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                {activeContract ? 'Active Lease Value' : 'Asking Rent'}
              </div>
            </div>

            {/* Card 2: Occupancy Status */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Occupancy Status
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: statusBadge.color, marginTop: 3 }}>
                {safeUpper(unit.status)}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeTenant?.name ? `Tenant: ${activeTenant.name}` : 'Ready for occupancy'}
              </div>
            </div>

            {/* Card 3: Size & Floor */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Built-Up Area
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginTop: 3 }}>
                {unit.size ? Number(unit.size).toLocaleString() : '—'} <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>SQFT</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                Floor {unit.floor ?? '—'} • {unit.type || 'Standard'}
              </div>
            </div>

            {/* Card 4: Furnishing */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Furnishing
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginTop: 3 }}>
                {unit.furnished ? 'Furnished' : 'Unfurnished'}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                {unit.dhewa_no ? `DEWA: ${unit.dhewa_no}` : (unit.category || 'Standard residential')}
              </div>
            </div>

            {/* Card 5: Service Charge */}
            <div style={{ background: '#FFFFFF', borderRadius: 8, border: '1px solid #E2E8F0', padding: '12px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Service Charge
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginTop: 3 }}>
                AED {Number(unit.monthly_service_charge || 0).toLocaleString()} <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>/ MO</span>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                Yearly: AED {(Number(unit.monthly_service_charge || 0) * 12).toLocaleString()}
              </div>
            </div>
          </div>

          {/* ─── 3. MAIN CONTENT: LEFT (60%) & RIGHT (40%) ─── */}
          <div className="unit-detail-grid">
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Section 1: Active Tenancy Contract */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid #E2E8F0', paddingBottom: 10 }}>
                  <div>
                    <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Active Tenancy Lease</h2>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>Current lease contract & registered tenant information</div>
                  </div>
                  {activeContract && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#F0FDF4',
                      color: '#065F46',
                      border: '1px solid #BBF7D0',
                      padding: '3px 8px',
                      borderRadius: 999,
                    }}>
                      Lease #{activeContract.id}
                    </span>
                  )}
                </div>

                {activeContract ? (
                  <div>
                    {/* Clean Key-Value Table */}
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                      {[
                        { label: 'Primary Tenant', value: activeTenant?.name || '—', highlight: true },
                        { label: 'Contact Phone', value: activeTenant?.phone || activeTenant?.contact || '—' },
                        { label: 'Email Address', value: activeTenant?.email || '—' },
                        { label: 'Payment Mode', value: activeContract.mode_of_payment || 'Cheque / Wire' },
                        { label: 'Lease Duration', value: `${formatDate(activeContract.start_date)} – ${formatDate(activeContract.end_date)}` },
                        { label: 'Annual Rent', value: `AED ${Number(activeContract.rent_amount || 0).toLocaleString()}` },
                        { label: 'Security Deposit', value: `AED ${Number(activeContract.security_deposit || 0).toLocaleString()}` },
                        { label: 'Outstanding Balance', value: `AED ${Number(activeContract.due || 0).toLocaleString()}`, alert: Number(activeContract.due) > 0 },
                      ].map((row, idx, arr) => (
                        <div
                          key={row.label}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                            borderBottom: idx < arr.length - 1 ? '1px solid #E2E8F0' : 'none',
                            fontSize: 13,
                          }}
                        >
                          <span style={{ color: '#475569', fontWeight: 600 }}>{row.label}</span>
                          <strong style={{
                            color: row.alert ? '#DC2626' : (row.highlight ? '#065F46' : '#0F172A'),
                            fontWeight: 700,
                          }}>
                            {row.value}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 12, textAlign: 'right' }}>
                      <Link
                        to={`/owner/contracts/${activeContract.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: '#065F46',
                          textDecoration: 'none',
                        }}
                      >
                        View Full Contract Details →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '28px 16px', background: '#F8FAFC', borderRadius: 8, border: '1px dashed #CBD5E1' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Unit is Currently Vacant</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 3, marginBottom: 14 }}>
                      There is no active tenant lease registered for this unit.
                    </div>
                    <Link
                      to={`/owner/contracts?create=1&unit_id=${unit.id}&property_id=${unit.property?.id || ''}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 16px',
                        borderRadius: 7,
                        background: '#065F46',
                        color: '#FFFFFF',
                        fontSize: 12.5,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <Icon path={ICONS.plus} size={14} />
                      <span>Create Contract</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Section 2: Unit Specifications Table */}
              <div style={cardStyle}>
                <div style={{ marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Unit Specifications</h2>
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                  {[
                    { label: 'Unit Number', value: `#${unit.number}` },
                    { label: 'Building / Tower', value: unit.property?.name || '—' },
                    { label: 'Floor Level', value: `Floor ${unit.floor ?? '—'}` },
                    { label: 'Layout Type', value: unit.type || 'Apartment' },
                    { label: 'Built-up Area', value: unit.size ? `${Number(unit.size).toLocaleString()} SQFT` : '—' },
                    { label: 'Furnishing Status', value: unit.furnished ? 'Fully Furnished' : 'Unfurnished' },
                    { label: 'DEWA Premise #', value: unit.dhewa_no || 'Not Registered' },
                    { label: 'Usage Category', value: unit.category || 'Residential' },
                  ].map((row, idx, arr) => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                        borderBottom: idx < arr.length - 1 ? '1px solid #E2E8F0' : 'none',
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: '#475569', fontWeight: 600 }}>{row.label}</span>
                      <strong style={{ color: '#0F172A', fontWeight: 700 }}>{row.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Past Contracts History Table */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Tenancy Contract History</h2>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 999 }}>
                    {unit.recent_contracts?.length || 0} Records
                  </span>
                </div>

                {unit.recent_contracts && unit.recent_contracts.length > 0 ? (
                  <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                          <th style={{ ...thStyle, padding: '10px 12px', fontSize: 11.5 }}>REF #</th>
                          <th style={{ ...thStyle, padding: '10px 12px', fontSize: 11.5 }}>Tenant</th>
                          <th style={{ ...thStyle, padding: '10px 12px', fontSize: 11.5 }}>Duration</th>
                          <th style={{ ...thStyle, padding: '10px 12px', fontSize: 11.5 }}>Rent (AED)</th>
                          <th style={{ ...thStyle, padding: '10px 12px', fontSize: 11.5 }}>Status</th>
                          <th style={{ ...thStyle, padding: '10px 12px', fontSize: 11.5, textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unit.recent_contracts.map((c) => {
                          const badge = getContractStatusBadge(c.status)
                          return (
                            <tr key={c.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                              <td style={{ ...tdStyle, padding: '10px 12px' }}>
                                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 12.5 }}>
                                  CTR-#{c.id}
                                </span>
                              </td>
                              <td style={{ ...tdStyle, padding: '10px 12px' }}>
                                <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 12.5 }}>{c.tenant?.name || '—'}</div>
                              </td>
                              <td style={{ ...tdStyle, padding: '10px 12px', fontSize: 12, color: '#475569' }}>
                                {formatDate(c.start_date)} – {formatDate(c.end_date)}
                              </td>
                              <td style={{ ...tdStyle, padding: '10px 12px', fontWeight: 700, color: '#0F172A', fontSize: 12.5 }}>
                                AED {Number(c.rent_amount || 0).toLocaleString()}
                              </td>
                              <td style={{ ...tdStyle, padding: '10px 12px' }}>
                                <span style={{
                                  background: badge.bg,
                                  color: badge.color,
                                  border: `1px solid ${badge.border}`,
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: 999,
                                  textTransform: 'uppercase',
                                }}>
                                  {badge.label}
                                </span>
                              </td>
                              <td style={{ ...tdStyle, padding: '10px 12px', textAlign: 'right' }}>
                                <Link
                                  to={`/owner/contracts/${c.id}`}
                                  className="gfh-portal-btn"
                                  style={{
                                    ...ghostBtnStyle,
                                    padding: '4px 10px',
                                    fontSize: 11.5,
                                    background: '#F8FAFC',
                                    color: '#065F46',
                                    border: '1px solid #CBD5E1',
                                  }}
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748B', fontSize: 12.5 }}>
                    No contracts recorded for this unit yet.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Section 4: Property & Building Profile Card */}
              <div style={cardStyle}>
                <div style={{ marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Building Profile</h2>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>Parent property specifications</div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>
                    {unit.property?.name || 'Property'}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>
                    {unit.property?.address}{unit.property?.city ? `, ${unit.property.city}` : ''}
                  </div>
                  {unit.property?.type && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase' }}>
                        {unit.property.type}
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/owner/units?q=${encodeURIComponent(unit.property?.name || '')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 7,
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#065F46',
                    fontWeight: 700,
                    fontSize: 12.5,
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <Icon path={ICONS.door} size={14} />
                  View All Units in this Building
                </Link>
              </div>

              {/* Section 5: Maintenance Complaints Card */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Maintenance</h2>
                  <Link to="/owner/complaints" style={{ fontSize: 11.5, fontWeight: 700, color: '#065F46', textDecoration: 'none' }}>
                    View All →
                  </Link>
                </div>

                {unit.recent_complaints && unit.recent_complaints.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {unit.recent_complaints.map((comp) => {
                      const prioBadge = getPriorityBadge(comp.priority)
                      const stBadge = getComplaintStatusBadge(comp.status)
                      return (
                        <div
                          key={comp.id}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {comp.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                              <span style={{
                                background: prioBadge.bg,
                                color: prioBadge.color,
                                border: `1px solid ${prioBadge.border}`,
                                fontSize: 9.5,
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: 999,
                                textTransform: 'uppercase',
                              }}>
                                {prioBadge.label}
                              </span>
                              <span style={{
                                background: stBadge.bg,
                                color: stBadge.color,
                                border: `1px solid ${stBadge.border}`,
                                fontSize: 9.5,
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: 999,
                                textTransform: 'uppercase',
                              }}>
                                {stBadge.label}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                            <span>{formatDate(comp.created_at)}</span>
                            <span>{comp.job?.assignedTo?.name ? `Assigned: ${comp.job.assignedTo.name}` : 'Unassigned'}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '18px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>No Open Complaints</div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Unit has no pending maintenance issues reported.</div>
                  </div>
                )}
              </div>

              {/* Section 6: Quick Navigation Links */}
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>
                  Quick Navigation
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Link
                    to="/owner/contracts"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 7,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      fontSize: 12.5,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>View All Contracts</span>
                    <Icon path={ICONS.arrowRight} size={13} />
                  </Link>

                  <Link
                    to="/owner/properties"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 7,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      fontSize: 12.5,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Browse Properties</span>
                    <Icon path={ICONS.arrowRight} size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
