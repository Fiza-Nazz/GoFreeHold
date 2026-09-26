import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDubaiDateTime } from '../../utils/formatDate'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle } from '../../components/gfh/adminTheme'
import { Link } from 'react-router-dom'

interface Complaint {
  id: number
  unit_id: number
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  resolved_at?: string
  tenant?: { name: string }
  unit?: { number: string; property?: { name: string; owner_id: number } }
  job?: { id: number; assigned_to?: number; assignedTo?: { id: number; name: string } }
}

interface Technician {
  id: number
  name: string
  email: string
}

const PRIORITY_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  low:       { bg: '#f0f9ff', color: '#075985', border: '#bae6fd' },
  medium:    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  high:      { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  emergency: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}

const STATUS_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  open:        { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  assigned:    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  in_progress: { bg: '#f0f9ff', color: '#075985', border: '#bae6fd' },
  resolved:    { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
  closed:      { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' },
}

const icons = {
  close: 'M18 6 6 18M6 6l12 12',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 8,
  color: THEME.ink,
  fontSize: 14,
  fontWeight: 500,
  padding: '10px 12px',
  width: '100%',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: '#0E5E48',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export default function OwnerComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [assignModal, setAssignModal] = useState<Complaint | null>(null)
  const [selectedTech, setSelectedTech] = useState('')
  const [assignBusy, setAssignBusy] = useState(false)

  const [statusModal, setStatusModal] = useState<Complaint | null>(null)
  const [newStatus, setNewStatus] = useState<string>('in_progress')
  const [statusNotes, setStatusNotes] = useState('')
  const [statusBusy, setStatusBusy] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [cRes, tRes] = await Promise.all([
        api.get('/owner/complaints'),
        api.get('/owner/technicians'),
      ])
      setComplaints(cRes.data?.data?.complaints || [])
      setTechnicians(tRes.data?.data?.technicians || [])
    } catch (err) {
      console.error('Failed to load owner complaints data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignModal || !selectedTech) return
    setAssignBusy(true)
    try {
      await api.post(`/owner/complaints/${assignModal.id}/assign`, { assigned_to: Number(selectedTech) })
      setAssignModal(null)
      setSelectedTech('')
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error assigning technician')
    } finally {
      setAssignBusy(false)
    }
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!statusModal) return
    setStatusBusy(true)
    try {
      await api.post(`/owner/complaints/${statusModal.id}/status`, { status: newStatus, notes: statusNotes })
      setStatusModal(null)
      setStatusNotes('')
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating complaint status')
    } finally {
      setStatusBusy(false)
    }
  }

  const filteredComplaints = statusFilter === 'all'
    ? complaints
    : complaints.filter(c => c.status === statusFilter)

  const openCount = complaints.filter(c => c.status === 'open').length
  const assignedCount = complaints.filter(c => c.status === 'assigned').length
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length
  const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      {/* Hero Header */}
      <div className="fade-in" style={heroStyle}>
        <CornerBrackets color="#0E5E48" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#0F8A67', marginBottom: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              Property Maintenance
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: THEME.ink, margin: 0, letterSpacing: '-0.02em' }}>
              Maintenance & Complaints
            </h1>
            <p style={{ fontSize: 13.5, color: THEME.textMuted, marginTop: 4, marginBottom: 0 }}>
              Review repair requests from your tenants and dispatch your dedicated maintenance crew.
            </p>
          </div>

          <Link
            to="/owner/staff"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 8,
              background: '#ECFDF8',
              color: '#065F46',
              border: '1px solid #A7F3DC',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
            }}
          >
            <Icon path={icons.user} size={15} />
            Manage Maintenance Staff ({technicians.length})
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div
          onClick={() => setStatusFilter('all')}
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: '18px 20px',
            border: `1.5px solid ${statusFilter === 'all' ? '#0E5E48' : '#E2E8F0'}`,
            boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Complaints
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>{complaints.length}</div>
        </div>

        <div
          onClick={() => setStatusFilter('open')}
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: '18px 20px',
            border: `1.5px solid ${statusFilter === 'open' ? '#DC2626' : '#E2E8F0'}`,
            boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Open / Pending
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#DC2626', marginTop: 4 }}>{openCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('assigned')}
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: '18px 20px',
            border: `1.5px solid ${statusFilter === 'assigned' ? '#B45309' : '#E2E8F0'}`,
            boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Assigned to Tech
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#B45309', marginTop: 4 }}>{assignedCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('in_progress')}
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: '18px 20px',
            border: `1.5px solid ${statusFilter === 'in_progress' ? '#075985' : '#E2E8F0'}`,
            boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#075985', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            In Progress
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#075985', marginTop: 4 }}>{inProgressCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('resolved')}
          style={{
            background: '#FFFFFF',
            borderRadius: 12,
            padding: '18px 20px',
            border: `1.5px solid ${statusFilter === 'resolved' ? '#065F46' : '#E2E8F0'}`,
            boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Resolved
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#065F46', marginTop: 4 }}>{resolvedCount}</div>
        </div>
      </div>

      {/* Main Listing Panel */}
      <div className="fade-in" style={{ ...panelStyle, minHeight: 380, padding: 24, borderRadius: 14 }}>
        <CornerBrackets color="#0E5E48" />

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: THEME.textMuted }}>
            <span className="spinner" />
            <p style={{ marginTop: 12, fontSize: 13.5 }}>Loading complaints for your properties…</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                background: '#ECFDF8',
                color: '#0E5E48',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Icon path={ICONS.wrench} size={24} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              No Complaints Found
            </h3>
            <p style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4, maxWidth: 380, margin: '6px auto 0' }}>
              {statusFilter === 'all'
                ? 'No maintenance tickets logged by your tenants yet.'
                : `No complaints currently matching status: ${statusFilter}.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {filteredComplaints.map(item => (
              <div
                key={item.id}
                className="gfh-portal-stat"
                style={{
                  position: 'relative',
                  padding: '20px 22px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 10,
                  border: `1px solid #E2E8F0`,
                  boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 18,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 16, fontWeight: 800, color: THEME.ink }}>
                      #{item.id} — {item.title}
                    </strong>
                    <span
                      style={{
                        backgroundColor: (PRIORITY_BADGE[item.priority] || PRIORITY_BADGE.low).bg,
                        color: (PRIORITY_BADGE[item.priority] || PRIORITY_BADGE.low).color,
                        border: `1px solid ${(PRIORITY_BADGE[item.priority] || PRIORITY_BADGE.low).border}`,
                        padding: '3px 10px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                      }}
                    >
                      {(item.priority || '—').toString().toUpperCase()}
                    </span>
                    <span
                      style={{
                        backgroundColor: (STATUS_BADGE[item.status] || STATUS_BADGE.closed).bg,
                        color: (STATUS_BADGE[item.status] || STATUS_BADGE.closed).color,
                        border: `1px solid ${(STATUS_BADGE[item.status] || STATUS_BADGE.closed).border}`,
                        padding: '3px 10px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                      }}
                    >
                      {(item.status || '—').toString().replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <p style={{ fontSize: 13.5, fontWeight: 500, color: '#334155', marginBottom: 12, lineHeight: 1.5 }}>
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', gap: 18, fontSize: 12.5, color: THEME.textMuted, flexWrap: 'wrap' }}>
                    <span>
                      Issued: <strong style={{ color: THEME.ink }}>{formatDubaiDateTime(item.created_at)}</strong>
                    </span>
                    <span>
                      Category: <strong style={{ color: THEME.ink }}>{item.category || 'General'}</strong>
                    </span>
                    <span>
                      Unit: <strong style={{ color: THEME.ink }}>{item.unit?.number} ({item.unit?.property?.name})</strong>
                    </span>
                    <span>
                      Tenant: <strong style={{ color: THEME.ink }}>{item.tenant?.name || 'N/A'}</strong>
                    </span>
                    {item.job?.assignedTo?.name && (
                      <span style={{ color: '#065F46', background: '#ECFDF8', border: '1px solid #A7F3DC', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                        Assigned to: <strong>{item.job.assignedTo.name}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Assign Tech & Update Status */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  <button
                    className="gfh-portal-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      borderRadius: 8,
                      backgroundColor: '#075985',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(7, 89, 133, 0.25)',
                    }}
                    onClick={() => {
                      setAssignModal(item)
                      setSelectedTech(String(item.job?.assigned_to ?? item.job?.assignedTo?.id ?? ''))
                    }}
                  >
                    <Icon path={ICONS.wrench} size={14} />
                    Assign Tech
                  </button>

                  <button
                    className="gfh-portal-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      borderRadius: 8,
                      backgroundColor: '#B45309',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(180, 83, 9, 0.25)',
                    }}
                    onClick={() => {
                      setStatusModal(item)
                      setNewStatus(item.status)
                    }}
                  >
                    <Icon path={ICONS.edit} size={14} />
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL 1: ASSIGN TECHNICIAN (OWNER-SCOPED) ── */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 61, 58, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 460,
              maxWidth: '100%',
              padding: 28,
              background: '#ffffff',
              borderRadius: 12,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 20px 45px -10px rgba(6, 56, 44, 0.2)',
            }}
          >
            <CornerBrackets color="#0E5E48" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Assign Maintenance Job
                </h2>
                <div style={{ fontSize: 12, color: '#0E5E48', fontWeight: 600, marginTop: 2 }}>
                  Dispatch your dedicated maintenance crew
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted, padding: 4 }}
              >
                <Icon path={icons.close} size={18} />
              </button>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', margin: '14px 0 18px', fontSize: 12.5, color: '#475569' }}>
              <strong>Complaint #{assignModal.id}:</strong> {assignModal.title}
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                Location: Unit {assignModal.unit?.number} ({assignModal.unit?.property?.name})
              </div>
            </div>

            <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Your Maintenance Staff</label>
                {technicians.length === 0 ? (
                  <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 12.5, color: '#B45309' }}>
                    No maintenance technicians found under your account.{' '}
                    <Link to="/owner/staff" style={{ color: '#0E5E48', fontWeight: 700 }}>
                      Invite Maintenance Staff
                    </Link>
                  </div>
                ) : (
                  <select
                    style={inputStyle}
                    value={selectedTech}
                    onChange={e => setSelectedTech(e.target.value)}
                    required
                  >
                    <option value="">Select your technician</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setAssignModal(null)}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 16px',
                    backgroundColor: '#f1f5f9',
                    color: THEME.textMuted,
                    border: `1px solid ${THEME.border}`,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignBusy || !selectedTech || technicians.length === 0}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 18px',
                    backgroundColor: '#0E5E48',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: assignBusy || !selectedTech ? 'not-allowed' : 'pointer',
                    opacity: assignBusy || !selectedTech ? 0.6 : 1,
                  }}
                >
                  {assignBusy ? 'Assigning…' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: UPDATE COMPLAINT STATUS ── */}
      {statusModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 61, 58, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 460,
              maxWidth: '100%',
              padding: 28,
              background: '#ffffff',
              borderRadius: 12,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 20px 45px -10px rgba(6, 56, 44, 0.2)',
            }}
          >
            <CornerBrackets color="#0E5E48" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Update Complaint Status
                </h2>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                  Ticket #{statusModal.id}: {statusModal.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatusModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted, padding: 4 }}
              >
                <Icon path={icons.close} size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Resolution Status</label>
                <select
                  style={inputStyle}
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  required
                >
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Owner Inspection / Progress Notes</label>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="e.g. Technician dispatched, spare parts approved..."
                  value={statusNotes}
                  onChange={e => setStatusNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setStatusModal(null)}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 16px',
                    backgroundColor: '#f1f5f9',
                    color: THEME.textMuted,
                    border: `1px solid ${THEME.border}`,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusBusy}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 18px',
                    backgroundColor: '#0E5E48',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: statusBusy ? 'not-allowed' : 'pointer',
                  }}
                >
                  {statusBusy ? 'Saving…' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
