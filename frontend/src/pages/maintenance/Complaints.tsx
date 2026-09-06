import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { safeUpper, safeUpperLabel } from '../../utils/safeLabel'
import { formatDubaiDateTime } from '../../utils/formatDate'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle, RADIUS } from '../../components/gfh/adminTheme'

interface Complaint {
  id: number
  unit_id?: number
  title: string
  description: string
  status: string
  priority: string
  created_at?: string
  unit?: { id?: number; number: string; property?: { name: string } }
  tenant?: { name: string }
}

const icons = {
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  check: 'M20 6 9 17l-5-5',
  play: 'M5 3l14 9-14 9V3z',
  ticket: 'M15 5v2M15 11v2M15 17v2M5 5a2 2 0 0 0-2 2v3a2 2 0 1 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 1 1 0-4V7a2 2 0 0 0-2-2H5z',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  progress: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
}

const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  high:      { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  medium:    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  low:       { bg: '#f0f9ff', color: '#075985', border: '#bae6fd' },
  emergency: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  resolved:    { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
  in_progress: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  open:        { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  assigned:    { bg: '#f0f9ff', color: '#075985', border: '#bae6fd' },
}

type StatusFilterType = 'all' | 'open' | 'in_progress' | 'resolved'

/** Live APIs: GET /maintenance/complaints, POST /maintenance/complaints/{id}/status */
export default function MaintenanceComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all')

  const fetchComplaints = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/maintenance/complaints')
      setComplaints(res.data?.data?.complaints || [])
    } catch (err) {
      console.error(err)
      setComplaints([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchComplaints() }, [])

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.post(`/maintenance/complaints/${id}/status`, { status: newStatus })
      fetchComplaints()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.')
    }
  }

  const openCount = complaints.filter(c => c.status === 'open' || c.status === 'assigned').length
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length

  // Filter complaints by status ('all', 'open', 'in_progress', 'resolved') and search query (unit ID, unit number, issue title, issue description)
  const filteredComplaints = complaints.filter(c => {
    // 1. Status filter
    if (statusFilter === 'open' && c.status !== 'open' && c.status !== 'assigned') return false
    if (statusFilter === 'in_progress' && c.status !== 'in_progress') return false
    if (statusFilter === 'resolved' && c.status !== 'resolved') return false

    // 2. Search query (unit id, unit number, issue title/desc, tenant)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchTitle = (c.title || '').toLowerCase().includes(q)
      const matchDesc = (c.description || '').toLowerCase().includes(q)
      const matchUnitNum = (c.unit?.number || '').toLowerCase().includes(q)
      const matchUnitId = String(c.unit_id || c.unit?.id || '').includes(q)
      const matchTicketId = String(c.id).includes(q)
      const matchTenant = (c.tenant?.name || '').toLowerCase().includes(q)
      const matchProp = (c.unit?.property?.name || '').toLowerCase().includes(q)

      if (!matchTitle && !matchDesc && !matchUnitNum && !matchUnitId && !matchTicketId && !matchTenant && !matchProp) {
        return false
      }
    }

    return true
  })

  const statCards = [
    {
      value: complaints.length,
      label: 'Total complaints',
      icon: icons.ticket,
      iconBg: '#ECFDF8',
      iconColor: '#0E5E48',
      badgeBg: '#ECFDF8',
      badgeColor: '#065F46',
      badgeBorder: '#A7F3DC',
      sub: 'Total',
    },
    {
      value: openCount,
      label: 'Open queue',
      icon: icons.inbox,
      iconBg: openCount > 0 ? '#FEF2F2' : '#F0F9FF',
      iconColor: openCount > 0 ? '#DC2626' : '#0284C7',
      badgeBg: openCount > 0 ? '#FEF2F2' : '#F0F9FF',
      badgeColor: openCount > 0 ? '#991B1B' : '#075985',
      badgeBorder: openCount > 0 ? '#FECACA' : '#BAE6FD',
      sub: 'Open',
    },
    {
      value: inProgressCount,
      label: 'In progress',
      icon: icons.progress,
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
      badgeBg: '#FFFBEB',
      badgeColor: '#B45309',
      badgeBorder: '#FDE68A',
      sub: 'Active',
    },
    {
      value: resolvedCount,
      label: 'Resolved',
      icon: icons.check,
      iconBg: '#ECFDF8',
      iconColor: '#0F8A67',
      badgeBg: '#F0FDF4',
      badgeColor: '#065F46',
      badgeBorder: '#BBF7D0',
      sub: 'Done',
    },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Assigned complaints</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Live work queue</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>From your maintenance assignments</div>
        </div>
        <button
          className="gfh-portal-btn"
          onClick={fetchComplaints}
          disabled={isLoading}
          style={{
            ...ghostBtnStyle,
            background: '#0E5E48',
            borderRadius: 8,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          <Icon path={icons.refresh} size={16} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
        {statCards.map((card, i) => {
          const filterKeys: Record<string, StatusFilterType> = {
            'Total complaints': 'all',
            'Open queue': 'open',
            'In progress': 'in_progress',
            'Resolved': 'resolved',
          }
          const cardFilterKey = filterKeys[card.label] || 'all'
          const isSelected = statusFilter === cardFilterKey
          return (
            <div
              key={card.label}
              onClick={() => setStatusFilter(cardFilterKey)}
              className="gfh-portal-stat"
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '20px 22px',
                border: isSelected ? '2px solid #0E5E48' : '1px solid #E2E8F0',
                boxShadow: isSelected ? '0 4px 12px rgba(14, 94, 72, 0.12)' : '0 1px 3px rgba(16,24,40,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 124,
                cursor: 'pointer',
                animationDelay: `${i * 0.06}s`,
                transition: 'all 0.18s ease',
              }}
              title={`Click to filter by ${card.label}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: card.iconBg,
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={card.icon} size={20} />
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
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                  {card.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* In-page Status Filter & Search Bar */}
      <div
        className="fade-in"
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Status Filter Tabs / Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {[
            { key: 'all' as StatusFilterType, label: 'All', count: complaints.length },
            { key: 'open' as StatusFilterType, label: 'Open', count: openCount },
            { key: 'in_progress' as StatusFilterType, label: 'In Progress', count: inProgressCount },
            { key: 'resolved' as StatusFilterType, label: 'Resolved', count: resolvedCount },
          ].map(tab => {
            const isActive = statusFilter === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
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

        {/* Search Input: Unit ID, Unit #, Issue title/desc */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 260, maxWidth: 420 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <svg
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Unit ID, Unit #, Issue..."
              style={{
                width: '100%',
                padding: searchQuery ? '9px 32px 9px 34px' : '9px 12px 9px 34px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                fontSize: 13,
                color: '#0F172A',
                outline: 'none',
                fontFamily: "'Poppins', system-ui, sans-serif",
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

          {(searchQuery || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
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

      <div className="fade-in" style={{ ...panelStyle, minHeight: 320 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : filteredComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>
              {searchQuery || statusFilter !== 'all'
                ? 'No complaints found matching the current search / filter.'
                : 'No complaints assigned.'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                style={{
                  marginTop: 12,
                  padding: '7px 16px',
                  borderRadius: 8,
                  background: '#0E5E48',
                  color: '#fff',
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['ID', 'Issue', 'Unit', 'Tenant', 'Time', 'Priority', 'Status', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(c => {
                  const pr = PRIORITY_STYLE[c.priority] || PRIORITY_STYLE.low
                  const st = STATUS_STYLE[c.status] || STATUS_STYLE.open
                  return (
                    <tr key={c.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>#{c.id}</td>
                      <td style={tdStyle}>
                        <strong style={{ fontWeight: 700, color: THEME.ink }}>{c.title}</strong>
                        <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>{c.description}</div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>
                        {c.unit?.number || '—'}
                        {(c.unit_id || c.unit?.id) ? (
                          <span style={{ fontSize: 11, color: THEME.textMuted, marginLeft: 5, fontWeight: 500 }}>
                            (ID: #{c.unit_id || c.unit?.id})
                          </span>
                        ) : null}
                        <br />
                        <span style={{ fontSize: 12, color: THEME.textMuted }}>{c.unit?.property?.name || ''}</span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{c.tenant?.name || '—'}</td>
                      <td style={{ ...tdStyle, fontSize: 12, color: '#334155', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {formatDubaiDateTime(c.created_at)}
                      </td>
                      <td style={tdStyle}>
                        <span style={{ backgroundColor: pr.bg, color: pr.color, border: `1px solid ${pr.border}`, padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, display: 'inline-block' }}>
                          {safeUpper(c.priority)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, display: 'inline-block' }}>
                          {safeUpperLabel(c.status)}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {c.status !== 'in_progress' && c.status !== 'resolved' && (
                            <button
                              className="gfh-portal-btn"
                              onClick={() => handleStatusUpdate(c.id, 'in_progress')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8, background: '#0284C7', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(2, 132, 199, 0.2)' }}
                            >
                              <Icon path={icons.play} size={12} />
                              Start
                            </button>
                          )}
                          {c.status !== 'resolved' && (
                            <button
                              className="gfh-portal-btn"
                              onClick={() => handleStatusUpdate(c.id, 'resolved')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 8, background: '#0E5E48', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(14, 94, 72, 0.2)' }}
                            >
                              <Icon path={icons.check} size={12} />
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
