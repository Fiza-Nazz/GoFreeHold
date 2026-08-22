import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

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
  unit?: { number: string; property?: { name: string } }
  /** Eager-loaded as singular `job` with `assignedTo` (User) */
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
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  color: THEME.ink,
  fontSize: 14,
  fontWeight: 500,
  padding: '10px 12px',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 700,
  color: THEME.purple,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export default function ComplaintDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [assignModal, setAssignModal] = useState<Complaint | null>(null)
  const [selectedTech, setSelectedTech] = useState('')

  const [statusModal, setStatusModal] = useState<Complaint | null>(null)
  const [newStatus, setNewStatus] = useState<string>('in_progress')
  const [statusNotes, setStatusNotes] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [cRes, tRes] = await Promise.all([
        api.get('/admin/complaints'),
        api.get('/admin/technicians'),
      ])
      setComplaints(cRes.data?.data?.complaints || [])
      setTechnicians(tRes.data?.data?.technicians || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignModal || !selectedTech) return
    try {
      await api.post(`/admin/complaints/${assignModal.id}/assign`, { assigned_to: Number(selectedTech) })
      setAssignModal(null)
      setSelectedTech('')
      fetchData()
    } catch (err) {
      alert('Error assigning technician')
    }
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!statusModal) return
    try {
      await api.post(`/admin/complaints/${statusModal.id}/status`, { status: newStatus, notes: statusNotes })
      setStatusModal(null)
      setStatusNotes('')
      fetchData()
    } catch (err) {
      alert('Error updating complaint status')
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Complaint management dashboard
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Track, assign, and resolve maintenance requests
          </p>
        </div>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No maintenance complaints logged.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {complaints.map(item => (
              <div
                key={item.id}
                className="gfh-portal-stat"
                style={{
                  position: 'relative',
                  padding: 20,
                  backgroundColor: '#fff',
                  borderRadius: 0,
                  border: `1px solid ${THEME.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 20,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 9, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 15.5, fontWeight: 700, color: THEME.ink }}>#{item.id} — {item.title}</strong>
                    <span style={{ backgroundColor: (PRIORITY_BADGE[item.priority] || PRIORITY_BADGE.low).bg, color: (PRIORITY_BADGE[item.priority] || PRIORITY_BADGE.low).color, border: `1px solid ${(PRIORITY_BADGE[item.priority] || PRIORITY_BADGE.low).border}`, padding: '3px 11px', borderRadius: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.3px' }}>
                      {(item.priority || '—').toString().toUpperCase()}
                    </span>
                    <span style={{ backgroundColor: (STATUS_BADGE[item.status] || STATUS_BADGE.closed).bg, color: (STATUS_BADGE[item.status] || STATUS_BADGE.closed).color, border: `1px solid ${(STATUS_BADGE[item.status] || STATUS_BADGE.closed).border}`, padding: '3px 11px', borderRadius: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.3px' }}>
                      {(item.status || '—').toString().replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  <p style={{ fontSize: 14, fontWeight: 500, color: THEME.ink, marginBottom: 9 }}>{item.description}</p>

                  <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: THEME.textMuted, flexWrap: 'wrap' }}>
                    <span>Category: <strong style={{ color: THEME.ink }}>{item.category}</strong></span>
                    <span>Unit: <strong style={{ color: THEME.ink }}>{item.unit?.number} ({item.unit?.property?.name})</strong></span>
                    <span>Tenant: <strong style={{ color: THEME.ink }}>{item.tenant?.name || 'N/A'}</strong></span>
                    {item.job?.assignedTo?.name && (
                      <span>Assigned to: <strong style={{ color: THEME.violetLight }}>{item.job.assignedTo.name}</strong></span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    className="gfh-portal-btn"
                    style={{ padding: '7px 15px', fontSize: 12.5, fontWeight: 700, borderRadius: 0, backgroundColor: '#075985', color: '#fff', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setAssignModal(item); setSelectedTech(String(item.job?.assigned_to ?? item.job?.assignedTo?.id ?? '')); }}
                  >
                    Assign Tech
                  </button>
                  <button
                    className="gfh-portal-btn"
                    style={{ padding: '7px 15px', fontSize: 12.5, fontWeight: 700, borderRadius: 0, backgroundColor: '#b45309', color: '#fff', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setStatusModal(item); setNewStatus(item.status); }}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 61, 58, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 440,
              padding: 28,
              background: '#ffffff',
              borderRadius: 0,
              border: `1px solid ${THEME.border}`,
            }}
          >
            <CornerBrackets />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, margin: 0, color: THEME.purple }}>
                Assign maintenance job
              </h2>
              <button type="button" onClick={() => setAssignModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: THEME.textMuted, padding: 4 }}>
                <Icon path={icons.close} size={18} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500, marginBottom: 20 }}>
              Complaint #{assignModal.id}: {assignModal.title}
            </p>
            <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Select technician</label>
                <select style={inputStyle} value={selectedTech} onChange={e => setSelectedTech(e.target.value)} required>
                  <option value="">Choose technician</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="gfh-portal-btn"
                  onClick={() => setAssignModal(null)}
                  style={{ borderRadius: 0, fontWeight: 700, fontSize: 13.5, padding: '10px 18px', backgroundColor: '#f1f5f9', color: THEME.textMuted, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#065f46' }}>
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statusModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 61, 58, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 440,
              padding: 28,
              background: '#ffffff',
              borderRadius: 0,
              border: `1px solid ${THEME.border}`,
            }}
          >
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, marginBottom: 12, color: THEME.purple }}>
              Update complaint status
            </h2>
            <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>New status</label>
                <select style={inputStyle} value={newStatus} onChange={e => setNewStatus(e.target.value)} required>
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Notes / progress update</label>
                <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} value={statusNotes} onChange={e => setStatusNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="gfh-portal-btn"
                  onClick={() => setStatusModal(null)}
                  style={{ borderRadius: 0, fontWeight: 700, fontSize: 13.5, padding: '10px 18px', backgroundColor: '#f1f5f9', color: THEME.textMuted, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#065f46' }}>
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
