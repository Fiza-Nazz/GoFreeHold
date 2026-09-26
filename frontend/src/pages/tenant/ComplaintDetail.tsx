import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle } from '../../components/gfh/adminTheme'
import { safeUpper, safeUpperLabel } from '../../utils/safeLabel'
import { formatDubaiDateTime } from '../../utils/formatDate'

interface Complaint {
  id: number
  title: string
  description?: string
  status: string
  priority?: string
  created_at?: string
  unit?: { number?: string; property?: { name?: string; address?: string } }
}

const icons = {
  check: 'M20 6 9 17l-5-5',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1',
  clock: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 10.41l3.54 2.12-.75 1.23L11.5 13V7h1.5z',
  chevronLeft: 'M15 18l-6-6 6-6',
  alert: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0z',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  resolved:    { bg: '#ECFDF8', color: '#065F46', border: '#A7F3DC' },
  closed:      { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
  in_progress: { bg: '#F0F9FF', color: '#0284C7', border: '#BAE6FD' },
  open:        { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  assigned:    { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
}

const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  emergency: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  high:      { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  medium:    { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  low:       { bg: '#F0F9FF', color: '#075985', border: '#BAE6FD' },
}

export default function TenantComplaintDetail() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get('/tenant/complaints')
        const list: Complaint[] = res.data?.data?.complaints || []
        const found = list.find((c) => String(c.id) === String(id)) || null
        if (!found) {
          setError('Maintenance complaint ticket not found.')
          setComplaint(null)
        } else {
          setComplaint(found)
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load complaint.')
        setComplaint(null)
      } finally {
        setIsLoading(false)
      }
    }
    if (id) void load()
  }, [id])

  // Progress Stepper calculation
  const status = complaint?.status || 'open'
  const isResolved = status === 'resolved' || status === 'closed'
  const isInProgress = status === 'in_progress' || isResolved
  const isAssigned = status === 'assigned' || isInProgress

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: THEME.pageBg, minHeight: '100%' }}>
      <style>{portalPageCss}</style>

      {/* Hero Header */}
      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#10B981', marginBottom: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Ticket Overview
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.ink, letterSpacing: '-0.02em', marginTop: 2 }}>
            Complaint #{id}
          </div>
          <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
            Live status tracking and technician assignment details
          </div>
        </div>

        <Link
          to="/tenant/complaints"
          className="gfh-portal-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 16px',
            background: '#FFFFFF',
            color: '#059669',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <Icon path={icons.chevronLeft} size={16} />
          Back to Complaints
        </Link>
      </div>

      {isLoading ? (
        <div style={{ ...panelStyle, textAlign: 'center', padding: 50, borderRadius: 16 }}>
          <div style={{ display: 'inline-block', width: 34, height: 34, border: '3px solid #E2E8F0', borderTopColor: '#10B981', borderRadius: '50%', animation: 'gfhSpin 0.75s linear infinite' }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted, marginTop: 12 }}>Loading ticket details…</div>
          <style>{`@keyframes gfhSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ ...panelStyle, textAlign: 'center', padding: '40px 20px', borderRadius: 16, color: ADMIN_COLORS.red, fontWeight: 600 }}>
          <Icon path={icons.alert} size={32} />
          <div style={{ marginTop: 10, fontSize: 16 }}>{error}</div>
          <Link to="/tenant/complaints" style={{ display: 'inline-block', marginTop: 16, padding: '8px 16px', borderRadius: 8, background: '#10B981', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            Return to Complaints
          </Link>
        </div>
      ) : complaint ? (
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Progress Timeline Stepper */}
          <div
            className="fade-in"
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '24px 28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748B', marginBottom: 20 }}>
              Resolution Timeline
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', flexWrap: 'wrap', gap: 16 }}>
              {[
                { title: '1. Submitted', desc: 'Request logged in system', active: true, done: true },
                { title: '2. Dispatched', desc: 'Assigned to technician', active: isAssigned, done: isInProgress },
                { title: '3. In Progress', desc: 'Repair work on-site', active: isInProgress, done: isResolved },
                { title: '4. Resolved', desc: 'Inspected & finalized', active: isResolved, done: isResolved },
              ].map((step, idx) => (
                <div key={step.title} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 160 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: step.done ? '#10B981' : step.active ? '#0284C7' : '#F1F5F9',
                      color: step.done || step.active ? '#FFFFFF' : '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                      flexShrink: 0,
                      boxShadow: step.done || step.active ? '0 2px 8px rgba(14, 94, 72, 0.2)' : 'none',
                    }}
                  >
                    {step.done ? <Icon path={icons.check} size={16} /> : idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: step.active ? '#0F172A' : '#94A3B8' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Information & Description Panel */}
          <div
            className="fade-in"
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 28,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
            }}
          >
            {/* Header: Title and Status Pill */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 18, borderBottom: `1px solid #F1F5F9` }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 800, background: '#F1F5F9', color: '#0F172A', padding: '3px 9px', borderRadius: 6 }}>
                  #TKT-{String(complaint.id).padStart(4, '0')}
                </span>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, margin: '8px 0 0', letterSpacing: '-0.01em' }}>
                  {complaint.title}
                </h1>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {complaint.priority && (
                  <span
                    style={{
                      background: (PRIORITY_STYLE[complaint.priority?.toLowerCase() || ''] || PRIORITY_STYLE.low).bg,
                      color: (PRIORITY_STYLE[complaint.priority?.toLowerCase() || ''] || PRIORITY_STYLE.low).color,
                      border: `1px solid ${(PRIORITY_STYLE[complaint.priority?.toLowerCase() || ''] || PRIORITY_STYLE.low).border}`,
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    Priority: {safeUpper(complaint.priority)}
                  </span>
                )}
                <span
                  style={{
                    background: (STATUS_STYLE[complaint.status] || STATUS_STYLE.open).bg,
                    color: (STATUS_STYLE[complaint.status] || STATUS_STYLE.open).color,
                    border: `1px solid ${(STATUS_STYLE[complaint.status] || STATUS_STYLE.open).border}`,
                    padding: '4px 14px',
                    borderRadius: 999,
                    fontSize: 12.5,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {safeUpperLabel(complaint.status)}
                </span>
              </div>
            </div>

            {/* Description Block */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                Issue Description
              </div>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #EDF2F7',
                  borderRadius: 12,
                  padding: '16px 20px',
                  color: '#334155',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {complaint.description || 'No detailed description provided with this complaint.'}
              </div>
            </div>

            {/* Meta Grid */}
            <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              {/* Unit & Property */}
              <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#F6F8FA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10B981', marginBottom: 4 }}>
                  <Icon path={icons.building} size={16} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leased Unit</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: THEME.ink }}>
                  Unit {complaint.unit?.number || '—'}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {complaint.unit?.property?.name || 'Assigned Property'}
                </div>
              </div>

              {/* Timestamp */}
              <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#F6F8FA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284C7', marginBottom: 4 }}>
                  <Icon path={icons.clock} size={16} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date Submitted</span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.ink }}>
                  {complaint.created_at ? formatDubaiDateTime(complaint.created_at) : '—'}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Recorded in ticket register
                </div>
              </div>

              {/* Service Team */}
              <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#F6F8FA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D97706', marginBottom: 4 }}>
                  <Icon path={icons.wrench} size={16} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Handler</span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.ink }}>
                  Property Maintenance Team
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Field Technician Assigned
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
