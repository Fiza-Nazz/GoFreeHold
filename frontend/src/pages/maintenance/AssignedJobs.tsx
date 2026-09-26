import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import { requestError } from '../../components/rbac/helpers'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle } from '../../components/gfh/adminTheme'
import { safeUpper, safeUpperLabel } from '../../utils/safeLabel'
import { formatDubaiDateTime } from '../../utils/formatDate'

interface PropertyInfo {
  id?: number
  name?: string
  address?: string
  city?: string
}

interface UnitInfo {
  id?: number
  number?: string
  property_id?: number
  property?: PropertyInfo
}

interface ComplaintInfo {
  id?: number
  unit_id?: number
  title?: string
  description?: string
  priority?: string
  status?: string
  unit?: UnitInfo
}

interface JobItem {
  id: number
  complaint_id?: number
  team_id?: number | null
  assigned_to?: number
  assigned_by?: number
  status: 'assigned' | 'in_progress' | 'completed' | string
  scheduled_date?: string | null
  completed_at?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
  complaint?: ComplaintInfo
}

interface JobsData {
  counts: {
    assigned?: number
    in_progress?: number
    completed?: number
  }
  jobs: {
    data: JobItem[]
    current_page: number
    last_page: number
    total?: number
    per_page?: number
  }
}

const icons = {
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  wrench: 'M14.7 6.3a4 4 0 1 1-5.66 5.66l-6.36 6.36a1 1 0 0 0 0 1.42l1.58 1.58a1 1 0 0 0 1.42 0l6.36-6.36a4 4 0 0 0 5.66-5.66z',
  clock: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 10.41l3.54 2.12-.75 1.23L11.5 13V7h1.5z',
  check: 'M20 6 9 17l-5-5',
  checkCircle: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  play: 'M5 3l14 9-14 9V3z',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1',
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  pin: 'M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 3-3 3 3 0 0 1-3 3z',
  calendar: 'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14zm0-13H5V6h14z',
  alert: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0z',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
}

const PRIORITY_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  emergency: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  high:      { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  medium:    { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  low:       { bg: '#F0F9FF', color: '#075985', border: '#BAE6FD' },
}

const STATUS_BADGE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  assigned:    { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Assigned' },
  in_progress: { bg: '#F0F9FF', color: '#0284C7', border: '#BAE6FD', label: 'In Progress' },
  completed:   { bg: '#ECFDF8', color: '#065F46', border: '#A7F3DC', label: 'Completed' },
}

export default function AssignedJobs() {
  const [data, setData] = useState<JobsData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [revision, refresh] = useState(0)
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [savedSuccessId, setSavedSuccessId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const c = new AbortController()
    setLoading(true)
    setError('')
    api.get('/maintenance/jobs', {
      params: { page, status: status || undefined },
      signal: c.signal,
    })
      .then(({ data }) => setData(data.data))
      .catch(e => {
        if (!c.signal.aborted) setError(requestError(e))
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false)
      })
    return () => c.abort()
  }, [page, status, revision])

  async function update(job: JobItem, next: string) {
    setBusy(true)
    setError('')
    try {
      await api.post(`/maintenance/jobs/${job.id}/status`, {
        status: next,
        notes: notes[job.id] ?? job.notes ?? '',
      })
      setSavedSuccessId(job.id)
      setTimeout(() => setSavedSuccessId(null), 3500)
      refresh(v => v + 1)
    } catch (e) {
      setError(requestError(e))
    } finally {
      setBusy(false)
    }
  }

  // Counts
  const counts = data?.counts || {}
  const countAssigned = counts.assigned || 0
  const countInProgress = counts.in_progress || 0
  const countCompleted = counts.completed || 0
  const countTotal = countAssigned + countInProgress + countCompleted

  // Client-side quick filter on top of current page data
  const jobsList = data?.jobs?.data || []
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobsList
    const q = searchQuery.toLowerCase().trim()
    return jobsList.filter(job => {
      const matchId = String(job.id).includes(q)
      const matchTitle = (job.complaint?.title || '').toLowerCase().includes(q)
      const matchDesc = (job.complaint?.description || '').toLowerCase().includes(q)
      const matchProp = (job.complaint?.unit?.property?.name || '').toLowerCase().includes(q)
      const matchUnit = (job.complaint?.unit?.number || '').toLowerCase().includes(q)
      const matchAddr = (job.complaint?.unit?.property?.address || '').toLowerCase().includes(q)
      return matchId || matchTitle || matchDesc || matchProp || matchUnit || matchAddr
    })
  }, [jobsList, searchQuery])

  const kpiCards = [
    {
      key: '',
      label: 'All Work Orders',
      value: countTotal,
      sub: 'Total assigned',
      icon: icons.layers,
      iconBg: '#ECFDF8',
      iconColor: '#06382C',
      badgeBg: '#ECFDF8',
      badgeColor: '#065F46',
      badgeBorder: '#A7F3DC',
    },
    {
      key: 'assigned',
      label: 'Assigned Jobs',
      value: countAssigned,
      sub: 'Pending start',
      icon: icons.clock,
      iconBg: '#FFFBEB',
      iconColor: '#B45309',
      badgeBg: '#FFFBEB',
      badgeColor: '#B45309',
      badgeBorder: '#FDE68A',
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      value: countInProgress,
      sub: 'Active on field',
      icon: icons.wrench,
      iconBg: '#F0F9FF',
      iconColor: '#0284C7',
      badgeBg: '#F0F9FF',
      badgeColor: '#075985',
      badgeBorder: '#BAE6FD',
    },
    {
      key: 'completed',
      label: 'Completed',
      value: countCompleted,
      sub: 'Resolved & closed',
      icon: icons.checkCircle,
      iconBg: '#ECFDF8',
      iconColor: '#0F8A67',
      badgeBg: '#F0FDF4',
      badgeColor: '#065F46',
      badgeBorder: '#BBF7D0',
    },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: THEME.pageBg, minHeight: '100%' }}>
      <style>{portalPageCss}</style>

      {/* Hero Header */}
      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#0F8A67', marginBottom: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Field Operations Hub
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.ink, letterSpacing: '-0.02em', marginTop: 2 }}>
            My Assigned Jobs
          </div>
          <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
            Manage scheduled repairs, transition work order status & submit progress notes
          </div>
        </div>

        <button
          className="gfh-portal-btn"
          onClick={() => refresh(v => v + 1)}
          disabled={loading || busy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: '#0E5E48',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: loading || busy ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 6px rgba(14, 94, 72, 0.25)',
            opacity: loading || busy ? 0.75 : 1,
            transition: 'all 0.15s ease',
          }}
          title="Refresh Work Orders"
        >
          <Icon path={icons.refresh} size={16} />
          <span>{loading ? 'Refreshing…' : 'Refresh Tasks'}</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 18px',
            marginBottom: 20,
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 12,
            color: '#991B1B',
            fontSize: 13.5,
            fontWeight: 600,
          }}
          role="alert"
        >
          <Icon path={icons.alert} size={18} />
          <div style={{ flex: 1 }}>{error}</div>
          <button
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 800, fontSize: 14 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stat Cards (Interactive Filter) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 22 }}>
        {kpiCards.map((card, i) => {
          const isSelected = status === card.key
          return (
            <div
              key={card.label}
              onClick={() => {
                setStatus(card.key)
                setPage(1)
              }}
              className="gfh-portal-stat"
              style={{
                background: card.iconBg,
                borderRadius: 16,
                padding: '20px 22px',
                border: isSelected ? '2px solid #0E5E48' : `1px solid ${card.badgeBorder}`,
                boxShadow: isSelected ? '0 6px 16px rgba(14, 94, 72, 0.12)' : '0 1px 3px rgba(16,24,40,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 128,
                cursor: 'pointer',
                animationDelay: `${i * 0.05}s`,
                transition: 'all 0.18s ease',
                position: 'relative',
              }}
              title={`Filter by ${card.label}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#FFFFFF',
                  border: `1px solid ${card.badgeBorder}`,
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={card.icon} size={22} />
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  background: card.badgeBg,
                  color: card.badgeColor,
                  border: `1px solid ${card.badgeBorder}`,
                  padding: '3px 9px',
                  borderRadius: 999,
                }}>
                  {card.sub}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: isSelected ? '#0E5E48' : '#64748B', marginTop: 4 }}>
                  {card.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter & Search Bar */}
      <div
        className="fade-in"
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '14px 18px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
          marginBottom: 22,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {[
            { key: '', label: 'All Jobs', count: countTotal },
            { key: 'assigned', label: 'Assigned', count: countAssigned, dot: '#D97706' },
            { key: 'in_progress', label: 'In Progress', count: countInProgress, dot: '#0284C7' },
            { key: 'completed', label: 'Completed', count: countCompleted, dot: '#059669' },
          ].map(tab => {
            const isActive = status === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatus(tab.key)
                  setPage(1)
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  border: isActive ? '1px solid #0E5E48' : '1px solid #E2E8F0',
                  background: isActive ? '#0E5E48' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.dot && !isActive && (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: tab.dot }} />
                )}
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: isActive ? 'rgba(255,255,255,0.22)' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#64748B',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Real-time search */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, minWidth: 260, maxWidth: 420 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}>
              <Icon path={icons.search} size={15} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Job ID, Unit, Property or Issue…"
              style={{
                width: '100%',
                padding: searchQuery ? '9px 32px 9px 36px' : '9px 12px 9px 36px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: 13,
                color: '#0F172A',
                outline: 'none',
                fontFamily: "'Inter', system-ui, sans-serif",
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 12,
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {(searchQuery || status) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatus('')
                setPage(1)
              }}
              style={{
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              title="Reset all filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Work Orders Content */}
      {loading ? (
        <div style={{ ...panelStyle, textAlign: 'center', padding: '60px 20px', minHeight: 300 }}>
          <div style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: '#0E5E48', borderRadius: '50%', animation: 'gfhSpin 0.75s linear infinite' }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: THEME.textMuted, marginTop: 14 }}>
            Loading assigned jobs…
          </div>
          <style>{`@keyframes gfhSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{ ...panelStyle, textAlign: 'center', padding: '64px 20px', minHeight: 300 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F0FDF4', color: '#0F8A67', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon path={icons.wrench} size={28} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: THEME.ink }}>
            {searchQuery || status ? 'No Matching Work Orders' : 'No Assigned Jobs'}
          </div>
          <p style={{ fontSize: 13.5, color: THEME.textMuted, maxWidth: 460, margin: '8px auto 20px', lineHeight: 1.5 }}>
            {searchQuery || status
              ? 'No assigned work orders match your search query or status filter. Try clearing your filters to view all jobs.'
              : 'You have no maintenance jobs assigned at this moment. New assignments will appear here automatically.'}
          </p>
          {(searchQuery || status) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatus('')
                setPage(1)
              }}
              style={{
                background: '#0E5E48',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Show All Work Orders
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {filteredJobs.map(job => {
            const pr = PRIORITY_BADGE[job.complaint?.priority?.toLowerCase() || ''] || PRIORITY_BADGE.low
            const st = STATUS_BADGE[job.status] || { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', label: job.status }
            const currentNote = notes[job.id] ?? job.notes ?? ''
            const isSaved = savedSuccessId === job.id

            return (
              <section
                key={job.id}
                className="fade-in"
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  padding: 24,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Header Row: Job ID, Priority, Status & Schedule */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                    {/* Job ID Pill */}
                    <span
                      style={{
                        background: '#06382C',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: 12.5,
                        padding: '4px 12px',
                        borderRadius: 8,
                        letterSpacing: '0.4px',
                      }}
                    >
                      #JOB-{String(job.id).padStart(4, '0')}
                    </span>

                    {/* Priority Badge */}
                    {job.complaint?.priority && (
                      <span
                        style={{
                          background: pr.bg,
                          color: pr.color,
                          border: `1px solid ${pr.border}`,
                          fontWeight: 700,
                          fontSize: 11,
                          padding: '3px 10px',
                          borderRadius: 999,
                          letterSpacing: '0.4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Priority: {safeUpper(job.complaint.priority)}
                      </span>
                    )}

                    {/* Complaint ID reference */}
                    {job.complaint_id && (
                      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>
                        (Complaint #{job.complaint_id})
                      </span>
                    )}
                  </div>

                  {/* Status & Scheduled date */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                    {job.scheduled_date && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#F8FAFC',
                          color: '#475569',
                          border: '1px solid #E2E8F0',
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        <Icon path={icons.calendar} size={14} />
                        Sched: {job.scheduled_date.slice(0, 10)}
                      </span>
                    )}

                    {/* Status Pill */}
                    <span
                      style={{
                        background: st.bg,
                        color: st.color,
                        border: `1px solid ${st.border}`,
                        fontWeight: 800,
                        fontSize: 12,
                        padding: '4px 12px',
                        borderRadius: 999,
                        letterSpacing: '0.4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {st.label}
                    </span>
                  </div>
                </div>

                {/* Job / Issue Title & Description */}
                <div style={{ marginTop: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: THEME.ink, margin: 0, letterSpacing: '-0.01em' }}>
                    {job.complaint?.title || `Maintenance Work Order #${job.id}`}
                  </h2>

                  {job.complaint?.description && (
                    <div
                      style={{
                        marginTop: 10,
                        background: '#F8FAFC',
                        border: '1px solid #EDF2F7',
                        borderRadius: 10,
                        padding: '12px 16px',
                        color: '#334155',
                        fontSize: 13.5,
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                        Issue Description
                      </div>
                      {job.complaint.description}
                    </div>
                  )}
                </div>

                {/* Location Grid Box */}
                <div
                  style={{
                    marginTop: 16,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 12,
                  }}
                >
                  {/* Property */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      background: '#F6F8FA',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ECFDF8', color: '#0E5E48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon path={icons.building} size={18} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Property
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: THEME.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {job.complaint?.unit?.property?.name || 'Assigned Property'}
                      </div>
                    </div>
                  </div>

                  {/* Unit */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      background: '#F6F8FA',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon path={icons.door} size={18} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Unit Number
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: THEME.ink }}>
                        Unit {job.complaint?.unit?.number || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      background: '#F6F8FA',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon path={icons.pin} size={18} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Address / Location
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: THEME.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {job.complaint?.unit?.property?.address || 'On-site address'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Notes Textarea */}
                <div style={{ marginTop: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#334155' }}>
                      Technician Work Notes & Handover Log
                    </label>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>
                      {currentNote.length} / 4000
                    </span>
                  </div>

                  <textarea
                    maxLength={4000}
                    rows={3}
                    value={currentNote}
                    onChange={e => setNotes({ ...notes, [job.id]: e.target.value })}
                    placeholder="Enter diagnostic findings, parts replaced, technician observations, or resolution remarks…"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: 13,
                      color: '#0F172A',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      lineHeight: 1.5,
                      transition: 'border-color 0.15s ease',
                    }}
                  />

                  {/* Inline Saved Success Indicator */}
                  {isSaved && (
                    <div
                      className="fade-in"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 6,
                        padding: '4px 10px',
                        borderRadius: 6,
                        background: '#ECFDF8',
                        color: '#065F46',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      <Icon path={icons.check} size={13} />
                      Work notes and status updated successfully!
                    </div>
                  )}
                </div>

                {/* Action Buttons Bar */}
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 16,
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  {/* Left: Save Notes */}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void update(job, job.status)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '9px 16px',
                      borderRadius: 8,
                      background: '#075985',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: busy ? 'not-allowed' : 'pointer',
                      opacity: busy ? 0.7 : 1,
                      boxShadow: '0 1px 3px rgba(7, 89, 133, 0.2)',
                      transition: 'all 0.15s ease',
                    }}
                    title="Save current work notes"
                  >
                    <Icon path={icons.save} size={15} />
                    Save Notes
                  </button>

                  {/* Right: State Transition Buttons */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {job.status === 'assigned' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void update(job, 'in_progress')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 18px',
                          borderRadius: 8,
                          background: '#0284C7',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: busy ? 'not-allowed' : 'pointer',
                          opacity: busy ? 0.7 : 1,
                          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Icon path={icons.play} size={14} />
                        Start Work
                      </button>
                    )}

                    {job.status === 'in_progress' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void update(job, 'completed')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 18px',
                          borderRadius: 8,
                          background: '#065F46',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: busy ? 'not-allowed' : 'pointer',
                          opacity: busy ? 0.7 : 1,
                          boxShadow: '0 2px 6px rgba(6, 95, 70, 0.25)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Icon path={icons.checkCircle} size={15} />
                        Complete Job
                      </button>
                    )}

                    {job.status === 'completed' && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 7,
                          padding: '8px 14px',
                          borderRadius: 8,
                          background: '#ECFDF8',
                          color: '#065F46',
                          border: '1px solid #A7F3DC',
                          fontSize: 12.5,
                          fontWeight: 700,
                        }}
                      >
                        <Icon path={icons.check} size={15} />
                        Work Order Finalized
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )
          })}

          {/* Pagination Controls */}
          {data?.jobs && data.jobs.last_page > 1 && (
            <div
              className="fade-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                marginTop: 10,
              }}
            >
              <button
                type="button"
                disabled={page <= 1 || busy}
                onClick={() => setPage(page - 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  background: page <= 1 ? '#F8FAFC' : '#FFFFFF',
                  color: page <= 1 ? '#94A3B8' : '#334155',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <Icon path={icons.chevronLeft} size={16} />
                Previous
              </button>

              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                Page <span style={{ color: '#0E5E48' }}>{page}</span> of {data.jobs.last_page}
                {data.jobs.total ? (
                  <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginLeft: 8 }}>
                    ({data.jobs.total} total items)
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                disabled={page >= data.jobs.last_page || busy}
                onClick={() => setPage(page + 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  background: page >= data.jobs.last_page ? '#F8FAFC' : '#FFFFFF',
                  color: page >= data.jobs.last_page ? '#94A3B8' : '#334155',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: page >= data.jobs.last_page ? 'not-allowed' : 'pointer',
                }}
              >
                Next
                <Icon path={icons.chevronRight} size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
