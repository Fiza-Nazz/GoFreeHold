import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { Icon, ICONS, portalPageCss, ghostBtnStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

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
  grace_period?: number | string
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
  recent_payments?: PaymentInfo[]
}

const LOCAL_ICONS = {
  calendar: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
  mapPin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  layers: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  checkCircle: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-5.4-5.4A19.79 19.79 0 0 1 2.72 4.18 2 2 0 0 1 4.68 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 5.4 5.4l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
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
    padding: '16px 18px',
    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
  }

  /* ── Compute contract detail rows for the right-side key-value table ── */
  const contractDetailRows = activeContract ? [
    { label: 'Lease Term', value: activeContract.mode_of_payment || 'Monthly' },
    { label: 'Rent Amount', value: `AED ${Number(activeContract.rent_amount || 0).toLocaleString()}` },
    { label: 'Security Deposit', value: `AED ${Number(activeContract.security_deposit || 0).toLocaleString()}` },
    { label: 'Grace Period', value: activeContract.grace_period ? `${activeContract.grace_period} Days` : '—' },
    { label: 'Start Date', value: formatDate(activeContract.start_date) },
    { label: 'End Date', value: formatDate(activeContract.end_date) },
    { label: 'Balance Due', value: `AED ${Number(activeContract.due || 0).toLocaleString()}` },
  ] : []

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#F8FAFC', minHeight: '100vh', paddingBottom: 40 }}>
      <style>{`
        ${portalPageCss}
        .unit-detail-two-col {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 1060px) {
          .unit-detail-two-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ═══════════════ LOADING / ERROR / NOT FOUND STATES ═══════════════ */}
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
          {/* ═══════════════ 1. HEADER CARD — Property + Unit + Back ═══════════════ */}
          <div
            className="fade-in"
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              marginBottom: 2,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginBottom: 2 }}>
                  {unit.property?.name || 'Property'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#DC2626', margin: 0, letterSpacing: '-0.01em' }}>
                    {unit.number || '—'} {unit.type ? unit.type.toUpperCase() : ''}
                  </h1>
                  <span style={{
                    background: statusBadge.bg,
                    color: statusBadge.color,
                    border: `1px solid ${statusBadge.border}`,
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    textTransform: 'uppercase',
                  }}>
                    {statusBadge.label}
                  </span>
                </div>
              </div>
              <Link
                to="/owner/units"
                className="gfh-portal-btn"
                style={{
                  ...ghostBtnStyle,
                  background: '#075985',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '7px 16px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  borderRadius: 6,
                }}
              >
                Back
              </Link>
            </div>
          </div>

          {/* ═══════════════ 2. TENANT INFO STRIP ═══════════════ */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              padding: '12px 20px',
              marginBottom: 14,
              borderTop: '3px solid #3B82F6',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            }}
          >
            {activeTenant ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: '#0F8A67', color: '#FFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, flexShrink: 0,
                  }}>
                    {activeTenant.name ? activeTenant.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'TN'}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                      {activeTenant.name || '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 2 }}>
                      {(activeTenant.phone || activeTenant.contact) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                          <Icon path={LOCAL_ICONS.phone} size={13} />
                          {activeTenant.phone || activeTenant.contact}
                        </span>
                      )}
                      {activeTenant.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                          <Icon path="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" size={13} />
                          {activeTenant.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Action Buttons — Compact row like Paul's reference */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {activeContract && (
                    <Link
                      to={`/owner/contracts/${activeContract.id}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                        borderRadius: 5, background: '#065F46', color: '#FFF', border: 'none',
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      }}
                    >
                      <Icon path={ICONS.contracts} size={13} />
                      View Lease
                    </Link>
                  )}
                  {activeContract && (
                    <Link
                      to={`/owner/contracts/${activeContract.id}?action=vacate`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                        borderRadius: 5, background: '#DC2626', color: '#FFF', border: 'none',
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      }}
                    >
                      <Icon path={ICONS.door} size={13} />
                      Vacate
                    </Link>
                  )}
                  {!activeContract && (unit.status === 'AVAILABLE' || unit.status === 'VACANT') && (
                    <Link
                      to={`/owner/contracts?create=1&unit_id=${unit.id}&property_id=${unit.property?.id || ''}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                        borderRadius: 5, background: '#065F46', color: '#FFF', border: 'none',
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      }}
                    >
                      <Icon path={ICONS.plus} size={13} />
                      Create Contract
                    </Link>
                  )}
                  <Link
                    to="/owner/complaints"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                      borderRadius: 5, background: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1',
                      fontSize: 12, fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    <Icon path={ICONS.wrench} size={13} />
                    Complaints
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 13.5, color: '#64748B', fontWeight: 600 }}>
                  No active tenant — unit is currently vacant
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {(unit.status === 'AVAILABLE' || unit.status === 'VACANT') && (
                    <Link
                      to={`/owner/contracts?create=1&unit_id=${unit.id}&property_id=${unit.property?.id || ''}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                        borderRadius: 5, background: '#065F46', color: '#FFF', border: 'none',
                        fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      }}
                    >
                      <Icon path={ICONS.plus} size={13} />
                      Create Contract
                    </Link>
                  )}
                  <Link
                    to="/owner/complaints"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                      borderRadius: 5, background: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1',
                      fontSize: 12, fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    <Icon path={ICONS.wrench} size={13} />
                    Complaints
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════ 3. TWO-COLUMN GRID: Payments (Left) | Contract Details (Right) ═══════════════ */}
          <div className="unit-detail-two-col" style={{ marginBottom: 14 }}>
            {/* LEFT: Recent Payments Table */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Payments</h2>
                {activeContract && (
                  <Link
                    to={`/owner/contracts/${activeContract.id}`}
                    style={{ fontSize: 11, fontWeight: 700, color: '#065F46', textDecoration: 'none' }}
                  >
                    View All
                  </Link>
                )}
              </div>

              {(unit.recent_payments && unit.recent_payments.length > 0) ? (
                <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11 }}>Payment Date</th>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11 }}>Description</th>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11 }}>Amount</th>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11 }}>Pay Mode</th>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11 }}>Remarks</th>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11, textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unit.recent_payments.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ ...tdStyle, padding: '9px 12px', fontSize: 12, color: '#475569' }}>
                            {formatDate(p.date)}
                          </td>
                          <td style={{ ...tdStyle, padding: '9px 12px', fontSize: 12, fontWeight: 600, color: '#0F172A', textTransform: 'uppercase' }}>
                            {p.type || '—'}
                          </td>
                          <td style={{ ...tdStyle, padding: '9px 12px', fontSize: 12, fontWeight: 700, color: '#065F46' }}>
                            AED {Number(p.amount || 0).toLocaleString()}
                          </td>
                          <td style={{ ...tdStyle, padding: '9px 12px', fontSize: 12, color: '#475569', textTransform: 'uppercase' }}>
                            {p.mode || '—'}
                          </td>
                          <td style={{ ...tdStyle, padding: '9px 12px', fontSize: 12, color: '#64748B', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.remarks || '—'}
                          </td>
                          <td style={{ ...tdStyle, padding: '9px 12px', textAlign: 'center' }}>
                            {activeContract && (
                              <Link
                                to={`/owner/contracts/${activeContract.id}`}
                                title="View contract"
                                style={{ color: '#065F46', display: 'inline-flex' }}
                              >
                                <Icon path={LOCAL_ICONS.eye} size={15} />
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 16px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>No payments recorded</div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Payments will appear here once collected</div>
                </div>
              )}
            </div>

            {/* RIGHT: Contract Details Key-Value Table */}
            <div style={cardStyle}>
              <div style={{ marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Contract Details</h2>
              </div>

              {activeContract ? (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                  {contractDetailRows.map((row, idx, arr) => (
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
                        color: row.label === 'Balance Due' && Number(activeContract.due || 0) > 0 ? '#DC2626' : '#0F172A',
                        fontWeight: 700,
                      }}>
                        {row.value}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 16px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>No active contract</div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Create a lease contract to view details</div>
                </div>
              )}

              {activeContract && (
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <Link
                    to={`/owner/contracts/${activeContract.id}`}
                    style={{ fontSize: 12.5, fontWeight: 700, color: '#065F46', textDecoration: 'none' }}
                  >
                    View Full Contract →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════ 4. UNIT SPECIFICATIONS — Compact Single Row ═══════════════ */}
          <div style={{ ...cardStyle, marginBottom: 14 }}>
            <div style={{ marginBottom: 12, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Unit Specifications</h2>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 1, background: '#E2E8F0', borderRadius: 8, overflow: 'hidden',
            }}>
              {[
                { label: 'Floor', value: `Floor ${unit.floor ?? '—'}` },
                { label: 'Area', value: unit.size ? `${Number(unit.size).toLocaleString()} SQFT` : '—' },
                { label: 'Furnishing', value: unit.furnished ? 'Furnished' : 'Unfurnished' },
                { label: 'DEWA #', value: unit.dhewa_no || 'N/A' },
                { label: 'Category', value: unit.category || 'Residential' },
                { label: 'Asking Price', value: `AED ${Number(unit.price || 0).toLocaleString()}` },
                { label: 'Service Charge', value: `AED ${Number(unit.monthly_service_charge || 0).toLocaleString()}/mo` },
              ].map(item => (
                <div key={item.label} style={{ background: '#FFFFFF', padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 3 }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ═══════════════ 5. BOTTOM TWO-COLUMN: Contract History (Left) | Building + Complaints (Right) ═══════════════ */}
          <div className="unit-detail-two-col">
            {/* LEFT: Tenancy Contract History */}
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
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11 }}>REF #</th>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11 }}>Tenant</th>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11 }}>Duration</th>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11 }}>Rent</th>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11 }}>Status</th>
                        <th style={{ ...thStyle, padding: '9px 12px', fontSize: 11, textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unit.recent_contracts.map((c) => {
                        const badge = getContractStatusBadge(c.status)
                        return (
                          <tr key={c.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                            <td style={{ ...tdStyle, padding: '9px 12px' }}>
                              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 12 }}>
                                CTR-#{c.id}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, padding: '9px 12px' }}>
                              <div style={{ fontWeight: 600, color: '#1E293B', fontSize: 12 }}>{c.tenant?.name || '—'}</div>
                            </td>
                            <td style={{ ...tdStyle, padding: '9px 12px', fontSize: 11.5, color: '#475569' }}>
                              {formatDate(c.start_date)} – {formatDate(c.end_date)}
                            </td>
                            <td style={{ ...tdStyle, padding: '9px 12px', fontWeight: 700, color: '#0F172A', fontSize: 12 }}>
                              AED {Number(c.rent_amount || 0).toLocaleString()}
                            </td>
                            <td style={{ ...tdStyle, padding: '9px 12px' }}>
                              <span style={{
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`,
                                fontSize: 10,
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: 999,
                                textTransform: 'uppercase',
                              }}>
                                {badge.label}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, padding: '9px 12px', textAlign: 'right' }}>
                              <Link
                                to={`/owner/contracts/${c.id}`}
                                className="gfh-portal-btn"
                                style={{
                                  ...ghostBtnStyle,
                                  padding: '4px 10px',
                                  fontSize: 11,
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

            {/* RIGHT: Building Profile + Maintenance Complaints */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Building Profile */}
              <div style={cardStyle}>
                <div style={{ marginBottom: 10, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Building Profile</h2>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                    {unit.property?.name || 'Property'}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>
                    {unit.property?.address}{unit.property?.city ? `, ${unit.property.city}` : ''}
                  </div>
                  {unit.property?.type && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase' }}>
                        {unit.property.type}
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  to={`/owner/units?q=${encodeURIComponent(unit.property?.name || '')}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    width: '100%', padding: '7px 12px', borderRadius: 7,
                    background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#065F46',
                    fontWeight: 700, fontSize: 12, textDecoration: 'none', boxSizing: 'border-box',
                  }}
                >
                  <Icon path={ICONS.door} size={13} />
                  All Units in Building
                </Link>
              </div>

              {/* Maintenance Complaints */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Maintenance</h2>
                  <Link to="/owner/complaints" style={{ fontSize: 11, fontWeight: 700, color: '#065F46', textDecoration: 'none' }}>
                    View All →
                  </Link>
                </div>

                {unit.recent_complaints && unit.recent_complaints.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                            padding: '9px 12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {comp.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                              <span style={{
                                background: prioBadge.bg, color: prioBadge.color,
                                border: `1px solid ${prioBadge.border}`,
                                fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 999, textTransform: 'uppercase',
                              }}>
                                {prioBadge.label}
                              </span>
                              <span style={{
                                background: stBadge.bg, color: stBadge.color,
                                border: `1px solid ${stBadge.border}`,
                                fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 999, textTransform: 'uppercase',
                              }}>
                                {stBadge.label}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10.5, color: '#94A3B8', marginTop: 2 }}>
                            <span>{formatDate(comp.created_at)}</span>
                            <span>{comp.job?.assignedTo?.name ? `Assigned: ${comp.job.assignedTo.name}` : 'Unassigned'}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>No Open Complaints</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>No pending maintenance issues</div>
                  </div>
                )}
              </div>

              {/* Quick Navigation */}
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                  Quick Navigation
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <Link
                    to="/owner/contracts"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 12px', borderRadius: 7, background: '#F8FAFC',
                      border: '1px solid #E2E8F0', color: '#0F172A', fontSize: 12,
                      fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    <span>View All Contracts</span>
                    <Icon path={ICONS.arrowRight} size={12} />
                  </Link>
                  <Link
                    to="/owner/properties"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 12px', borderRadius: 7, background: '#F8FAFC',
                      border: '1px solid #E2E8F0', color: '#0F172A', fontSize: 12,
                      fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    <span>Browse Properties</span>
                    <Icon path={ICONS.arrowRight} size={12} />
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
