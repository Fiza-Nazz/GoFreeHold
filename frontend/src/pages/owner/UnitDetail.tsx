import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, Icon, ICONS, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'
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

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        ${portalPageCss}
        .unit-detail-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.85fr) minmax(0, 1.15fr);
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 1060px) {
          .unit-detail-grid {
            grid-template-columns: 1fr;
          }
        }
        .spec-item-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px 16px;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .spec-item-box:hover {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }
      `}</style>

      {/* Hero Header */}
      <div className="fade-in" style={heroStyle}>
        <div>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B', fontWeight: 500, marginBottom: 6 }}>
            <Link to="/owner/dashboard" style={{ color: '#0F8A67', textDecoration: 'none', fontWeight: 600 }}>Portfolio</Link>
            <span>/</span>
            <Link to="/owner/units" style={{ color: '#0F8A67', textDecoration: 'none', fontWeight: 600 }}>Units</Link>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: 700 }}>Unit {unit?.number || unitId}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Unit #{unit?.number || '—'}
            </h1>
            {unit?.type && (
              <span style={{
                background: '#ECFDF8',
                color: '#065F46',
                border: '1px solid #A7F3DC',
                fontSize: 12,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 999,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}>
                {unit.type}
              </span>
            )}
            {unit && (
              <span style={{
                background: statusBadge.bg,
                color: statusBadge.color,
                border: `1px solid ${statusBadge.border}`,
                fontSize: 12,
                fontWeight: 700,
                padding: '3px 12px',
                borderRadius: 999,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}>
                {statusBadge.label}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748B', marginTop: 6, fontWeight: 500 }}>
            <Icon path={ICONS.building} size={15} />
            <span style={{ fontWeight: 600, color: '#1E293B' }}>{unit?.property?.name || 'Property'}</span>
            {unit?.property?.city && <span>• {unit.property.city}</span>}
            {unit?.floor != null && <span>• Floor {unit.floor}</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link
            to="/owner/units"
            className="gfh-portal-btn"
            style={{
              ...ghostBtnStyle,
              background: '#FFFFFF',
              color: '#334155',
              border: '1px solid #CBD5E1',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
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
                background: '#0F8A67',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(15, 138, 103, 0.25)',
              }}
            >
              <Icon path={ICONS.plus} size={15} />
              Create Contract
            </Link>
          )}

          {activeContract && (
            <Link
              to={`/owner/contracts/${activeContract.id}`}
              className="gfh-portal-btn"
              style={{
                ...ghostBtnStyle,
                background: '#0E5E48',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(14, 94, 72, 0.25)',
              }}
            >
              <Icon path={ICONS.contracts} size={15} />
              View Active Lease
            </Link>
          )}

          {activeContract && (
            <Link
              to={`/owner/contracts/${activeContract.id}?action=vacate`}
              className="gfh-portal-btn"
              style={{
                ...ghostBtnStyle,
                background: '#DC2626',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
              }}
              title="Start vacate and move-out settlement process for this unit"
            >
              <Icon path={ICONS.door} size={15} />
              Vacate / End Contract
            </Link>
          )}

          <Link
            to="/owner/complaints"
            className="gfh-portal-btn"
            style={{
              ...ghostBtnStyle,
              background: '#ECFDF8',
              color: '#065F46',
              border: '1px solid #A7F3DC',
            }}
          >
            <Icon path={ICONS.wrench} size={15} />
            Complaints
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div style={{ ...panelStyle, textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: '#0F8A67', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: 14, color: '#64748B', fontSize: 14, fontWeight: 500 }}>Loading unit portfolio profile...</p>
        </div>
      ) : error ? (
        <div style={{ ...panelStyle, textAlign: 'center', padding: '50px 20px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Icon path={ICONS.alert} size={22} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#991B1B' }}>{error}</div>
          <Link to="/owner/units" style={{ display: 'inline-block', marginTop: 14, color: '#0F8A67', fontWeight: 600, fontSize: 13 }}>
            ← Return to Units list
          </Link>
        </div>
      ) : !unit ? (
        <div style={{ ...panelStyle, textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: 15, color: '#64748B', fontWeight: 500 }}>Unit record could not be found.</p>
          <Link to="/owner/units" style={{ display: 'inline-block', marginTop: 10, color: '#0F8A67', fontWeight: 600, fontSize: 13 }}>
            ← Back to Units
          </Link>
        </div>
      ) : (
        <>
          {/* Top KPI Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
            {/* Card 1: Annual Rent */}
            <div
              className="gfh-portal-stat"
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '20px 22px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 124,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#ECFDF8', color: '#0E5E48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon path={ICONS.wallet} size={20} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', background: '#ECFDF8', color: '#065F46', border: '1px solid #A7F3DC', padding: '3px 9px', borderRadius: 999 }}>
                  AED / YR
                </span>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  AED {Number(activeContract?.rent_amount || unit.price || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                  {activeContract ? 'Active Lease Value' : 'Standard Asking Rent'}
                </div>
              </div>
            </div>

            {/* Card 2: Occupancy Status */}
            <div
              className="gfh-portal-stat"
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '20px 22px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 124,
                animationDelay: '0.05s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: unit.status === 'OCCUPIED' ? '#FEF2F2' : '#F0FDF4',
                  color: unit.status === 'OCCUPIED' ? '#DC2626' : '#0F8A67',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon path={ICONS.door} size={20} />
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  background: statusBadge.bg,
                  color: statusBadge.color,
                  border: `1px solid ${statusBadge.border}`,
                  padding: '3px 9px',
                  borderRadius: 999,
                }}>
                  {statusBadge.label}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  {safeUpper(unit.status)}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                  {activeTenant?.name ? `Tenant: ${activeTenant.name}` : 'Ready for occupancy'}
                </div>
              </div>
            </div>

            {/* Card 3: Size & Floor */}
            <div
              className="gfh-portal-stat"
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '20px 22px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 124,
                animationDelay: '0.1s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon path={LOCAL_ICONS.layers} size={20} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', background: '#F0F9FF', color: '#075985', border: '1px solid #BAE6FD', padding: '3px 9px', borderRadius: 999 }}>
                  AREA
                </span>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  {unit.size ? Number(unit.size).toLocaleString() : '—'} <span style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>SQFT</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                  Floor {unit.floor ?? '—'} • {unit.type || 'Standard layout'}
                </div>
              </div>
            </div>

            {/* Card 4: Furnishing & Specifications */}
            <div
              className="gfh-portal-stat"
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '20px 22px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 124,
                animationDelay: '0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon path={ICONS.check} size={20} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', padding: '3px 9px', borderRadius: 999 }}>
                  FITOUT
                </span>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  {unit.furnished ? 'Furnished' : 'Unfurnished'}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                  {unit.dhewa_no ? `DEWA: ${unit.dhewa_no}` : (unit.category ? `Category: ${unit.category}` : 'Standard residential')}
                </div>
              </div>
            </div>

            {/* Card 5: Service Charge & Maintenance Cost */}
            <div
              className="gfh-portal-stat"
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '20px 22px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 124,
                animationDelay: '0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon path={LOCAL_ICONS.bolt} size={20} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', background: '#F0F9FF', color: '#0284C7', border: '1px solid #BAE6FD', padding: '3px 9px', borderRadius: 999 }}>
                  SERVICE CHARGE
                </span>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  AED {Number(unit.monthly_service_charge || 0).toLocaleString()} <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>/ MO</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0284C7', marginTop: 4 }}>
                  Quarterly: AED {(Number(unit.monthly_service_charge || 0) * 3).toLocaleString()} • Yearly: AED {(Number(unit.monthly_service_charge || 0) * 12).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid: Left Column (65%) & Right Column (35%) */}
          <div className="unit-detail-grid">
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Section 1: Active Tenancy & Tenant Information Card */}
              <div className="fade-in" style={panelStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ECFDF8', color: '#0E5E48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon path={LOCAL_ICONS.user} size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Active Tenancy Contract</h2>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Current lease contract & registered tenant information</div>
                    </div>
                  </div>
                  {activeContract && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      background: '#F0FDF4',
                      color: '#065F46',
                      border: '1px solid #BBF7D0',
                      padding: '4px 10px',
                      borderRadius: 999,
                    }}>
                      Lease #{activeContract.id}
                    </span>
                  )}
                </div>

                {activeContract ? (
                  <div>
                    {/* Tenant Profile Banner */}
                    <div style={{
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                      border: '1px solid #E2E8F0',
                      borderRadius: 12,
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 14,
                      marginBottom: 16,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: '#0E5E48',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 18,
                          boxShadow: '0 2px 6px rgba(14, 94, 72, 0.25)',
                          flexShrink: 0,
                        }}>
                          {activeTenant?.name ? activeTenant.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'TN'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>
                              {activeTenant?.name || 'Tenant on File'}
                            </span>
                            <span style={{ background: '#ECFDF8', color: '#065F46', border: '1px solid #A7F3DC', fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>
                              Verified
                            </span>
                          </div>
                          <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                            Primary Leaseholder • Active Contract #{activeContract.id}
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/owner/contracts/${activeContract.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: '#0F8A67',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          padding: '7px 14px',
                          borderRadius: 8,
                          textDecoration: 'none',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                      >
                        View Full Contract
                        <Icon path={ICONS.arrowRight} size={14} />
                      </Link>
                    </div>

                    {/* Contact & Payment Info 3-Box Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
                      <div className="spec-item-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          <Icon path={LOCAL_ICONS.mail} size={13} />
                          Email Address
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', marginTop: 6, wordBreak: 'break-word' }}>
                          {activeTenant?.email || '—'}
                        </div>
                      </div>

                      <div className="spec-item-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          <Icon path={ICONS.phone} size={13} />
                          Contact Phone
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', marginTop: 6 }}>
                          {activeTenant?.phone || activeTenant?.contact || '—'}
                        </div>
                      </div>

                      <div className="spec-item-box">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          <Icon path={ICONS.wallet} size={13} />
                          Payment Mode
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', marginTop: 6 }}>
                          {activeContract.mode_of_payment || 'Cheque / Wire'}
                        </div>
                      </div>
                    </div>

                    {/* Lease Financials & Timeline 4-Box Grid */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 18px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                        Lease Schedule & Financials
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                        <div>
                          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Lease Commencement</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 3 }}>
                            {formatDate(activeContract.start_date)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Lease Expiry</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 3 }}>
                            {formatDate(activeContract.end_date)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Security Deposit</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 3 }}>
                            AED {Number(activeContract.security_deposit || 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Outstanding Balance</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: Number(activeContract.due) > 0 ? '#DC2626' : '#0F8A67', marginTop: 3 }}>
                            AED {Number(activeContract.due || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px dashed #CBD5E1' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F1F5F9', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Icon path={ICONS.door} size={22} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Unit is Currently Vacant</div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 4, maxWidth: 380, margin: '4px auto 16px' }}>
                      There is no active tenant lease registered for this unit. Start a guided contract directly from here.
                    </div>
                    <Link
                      to={`/owner/contracts?create=1&unit_id=${unit.id}&property_id=${unit.property?.id || ''}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 7,
                        padding: '9px 18px',
                        borderRadius: 8,
                        background: '#0F8A67',
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(15, 138, 103, 0.25)',
                      }}
                    >
                      <Icon path={ICONS.plus} size={15} />
                      <span>Create Contract</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Section 2: Unit Specifications & Technical Details */}
              <div className="fade-in" style={panelStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon path={LOCAL_ICONS.shield} size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Unit Specifications & Attributes</h2>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Architectural parameters and utility registrations</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <div className="spec-item-box">
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Unit Number</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>#{unit.number}</div>
                  </div>

                  <div className="spec-item-box">
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Building / Tower</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>{unit.property?.name || '—'}</div>
                  </div>

                  <div className="spec-item-box">
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Floor Level</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>Floor {unit.floor ?? '—'}</div>
                  </div>

                  <div className="spec-item-box">
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Layout Type</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>{unit.type || 'Apartment'}</div>
                  </div>

                  <div className="spec-item-box">
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Built-up Area</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                      {unit.size ? `${Number(unit.size).toLocaleString()} SQFT` : '—'}
                    </div>
                  </div>

                  <div className="spec-item-box">
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Furnishing</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                      {unit.furnished ? 'Fully Furnished' : 'Unfurnished'}
                    </div>
                  </div>

                  <div className="spec-item-box">
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>DEWA Premise #</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: unit.dhewa_no ? '#0F172A' : '#94A3B8', marginTop: 4 }}>
                      {unit.dhewa_no || 'Not Registered'}
                    </div>
                  </div>

                  <div className="spec-item-box">
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Category</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                      {unit.category || 'Residential'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Past Contracts History Table */}
              <div className="fade-in" style={panelStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FFFBEB', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon path={LOCAL_ICONS.calendar} size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Tenancy Contract History</h2>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                        All historical and current leasing contracts recorded for this unit
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '3px 10px', borderRadius: 999 }}>
                    {unit.recent_contracts?.length || 0} Records
                  </span>
                </div>

                {unit.recent_contracts && unit.recent_contracts.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Contract REF</th>
                          <th style={thStyle}>Tenant</th>
                          <th style={thStyle}>Lease Duration</th>
                          <th style={thStyle}>Rent (AED)</th>
                          <th style={thStyle}>Status</th>
                          <th style={{ ...thStyle, textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unit.recent_contracts.map((c) => {
                          const badge = getContractStatusBadge(c.status)
                          return (
                            <tr key={c.id} className="gfh-portal-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={tdStyle}>
                                <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 13 }}>
                                  CTR-#{c.id}
                                </span>
                              </td>
                              <td style={tdStyle}>
                                <div style={{ fontWeight: 600, color: '#1E293B' }}>{c.tenant?.name || '—'}</div>
                                <div style={{ fontSize: 11.5, color: '#64748B' }}>{c.tenant?.phone || c.tenant?.email || ''}</div>
                              </td>
                              <td style={tdStyle}>
                                <div style={{ fontSize: 12.5, color: '#334155' }}>
                                  {formatDate(c.start_date)} – {formatDate(c.end_date)}
                                </div>
                              </td>
                              <td style={tdStyle}>
                                <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                  AED {Number(c.rent_amount || 0).toLocaleString()}
                                </div>
                              </td>
                              <td style={tdStyle}>
                                <span style={{
                                  background: badge.bg,
                                  color: badge.color,
                                  border: `1px solid ${badge.border}`,
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 999,
                                  textTransform: 'uppercase',
                                }}>
                                  {badge.label}
                                </span>
                              </td>
                              <td style={{ ...tdStyle, textAlign: 'right' }}>
                                <Link
                                  to={`/owner/contracts/${c.id}`}
                                  className="gfh-portal-btn"
                                  style={{
                                    ...ghostBtnStyle,
                                    padding: '5px 12px',
                                    fontSize: 12,
                                    background: '#ECFDF8',
                                    color: '#065F46',
                                    border: '1px solid #A7F3DC',
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
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748B', fontSize: 13 }}>
                    No contracts recorded for this unit yet.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Section 4: Property & Building Profile Card */}
              <div className="fade-in" style={panelStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ECFDF8', color: '#0E5E48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon path={ICONS.building} size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Building Profile</h2>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Parent property specifications</div>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>
                    {unit.property?.name || 'Property'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B', marginTop: 6 }}>
                    <Icon path={LOCAL_ICONS.mapPin} size={14} />
                    <span>{unit.property?.address}{unit.property?.city ? `, ${unit.property.city}` : ''}</span>
                  </div>
                  {unit.property?.type && (
                    <div style={{ marginTop: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: '#ECFDF8', color: '#065F46', border: '1px solid #A7F3DC', padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase' }}>
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
                    gap: 8,
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0E5E48',
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    boxSizing: 'border-box',
                  }}
                >
                  <Icon path={ICONS.door} size={15} />
                  View All Units in this Building
                </Link>
              </div>

              {/* Section 5: Maintenance Complaints Card */}
              <div className="fade-in" style={panelStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid #E2E8F0', paddingBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon path={ICONS.wrench} size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Maintenance</h2>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Complaints & service work orders</div>
                    </div>
                  </div>
                  <Link to="/owner/complaints" style={{ fontSize: 12, fontWeight: 700, color: '#0F8A67', textDecoration: 'none' }}>
                    View All →
                  </Link>
                </div>

                {unit.recent_complaints && unit.recent_complaints.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {unit.recent_complaints.map((comp) => {
                      const prioBadge = getPriorityBadge(comp.priority)
                      const stBadge = getComplaintStatusBadge(comp.status)
                      return (
                        <div
                          key={comp.id}
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 12,
                            padding: '14px 16px',
                            transition: 'border-color 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {comp.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <span style={{
                                background: prioBadge.bg,
                                color: prioBadge.color,
                                border: `1px solid ${prioBadge.border}`,
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 999,
                                textTransform: 'uppercase',
                              }}>
                                {prioBadge.label}
                              </span>
                              <span style={{
                                background: stBadge.bg,
                                color: stBadge.color,
                                border: `1px solid ${stBadge.border}`,
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 999,
                                textTransform: 'uppercase',
                              }}>
                                {stBadge.label}
                              </span>
                            </div>
                          </div>

                          {comp.description && (
                            <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {comp.description}
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#94A3B8', borderTop: '1px solid #EEF2F6', paddingTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Icon path={LOCAL_ICONS.clock} size={12} />
                              <span>{formatDate(comp.created_at)}</span>
                            </div>
                            <div>
                              {comp.job?.assignedTo?.name ? (
                                <span style={{ color: '#0F8A67', fontWeight: 600 }}>Assigned: {comp.job.assignedTo.name}</span>
                              ) : (
                                <span>Unassigned</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ECFDF8', color: '#0F8A67', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <Icon path={LOCAL_ICONS.checkCircle} size={18} />
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>No Open Complaints</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Unit has no pending maintenance issues reported.</div>
                  </div>
                )}
              </div>

              {/* Section 6: Quick Navigation Links */}
              <div className="fade-in" style={panelStyle}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
                  Portfolio Quick Links
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link
                    to="/owner/contracts"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon path={ICONS.contracts} size={15} />
                      View All Contracts
                    </span>
                    <Icon path={ICONS.arrowRight} size={14} />
                  </Link>

                  <Link
                    to="/owner/properties"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#0F172A',
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon path={ICONS.building} size={15} />
                      Browse Properties Portfolio
                    </span>
                    <Icon path={ICONS.arrowRight} size={14} />
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
