import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import { Link } from 'react-router-dom'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'
import { safeUpper, safeUpperLabel } from '../../utils/safeLabel'
import { formatDubaiDateTime } from '../../utils/formatDate'

interface Complaint {
  id: number
  title: string
  description?: string
  priority?: string
  category?: string
  status: string
  created_at: string
  unit?: { number?: string; property?: { name?: string } }
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  ticket: 'M15 5v2M15 11v2M15 17v2M5 5a2 2 0 0 0-2 2v3a2 2 0 1 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 1 1 0-4V7a2 2 0 0 0-2-2H5z',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  check: 'M20 6 9 17l-5-5',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
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

type StatusFilterType = 'all' | 'open' | 'in_progress' | 'resolved'

export default function TenantComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/tenant/complaints')
      setComplaints(res.data?.data?.complaints || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const openCount = complaints.filter(c => c.status !== 'resolved' && c.status !== 'closed').length
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length
  const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (statusFilter === 'open' && (c.status === 'resolved' || c.status === 'closed')) return false
      if (statusFilter === 'in_progress' && c.status !== 'in_progress') return false
      if (statusFilter === 'resolved' && c.status !== 'resolved' && c.status !== 'closed') return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = (c.title || '').toLowerCase().includes(q)
        const matchDesc = (c.description || '').toLowerCase().includes(q)
        const matchId = String(c.id).includes(q)
        const matchProp = (c.unit?.property?.name || '').toLowerCase().includes(q)
        const matchUnit = (c.unit?.number || '').toLowerCase().includes(q)
        return matchTitle || matchDesc || matchId || matchProp || matchUnit
      }
      return true
    })
  }, [complaints, statusFilter, searchQuery])

  const statCards = [
    {
      key: 'all' as StatusFilterType,
      value: complaints.length,
      label: 'Total complaints',
      icon: icons.ticket,
      iconBg: '#ECFDF8',
      iconColor: '#0E5E48',
      badgeBg: '#ECFDF8',
      badgeColor: '#065F46',
      badgeBorder: '#A7F3DC',
      sub: 'All Tickets',
    },
    {
      key: 'open' as StatusFilterType,
      value: openCount,
      label: 'Open / active',
      icon: icons.inbox,
      iconBg: openCount > 0 ? '#FEF2F2' : '#F0F9FF',
      iconColor: openCount > 0 ? '#DC2626' : '#0284C7',
      badgeBg: openCount > 0 ? '#FEF2F2' : '#F0F9FF',
      badgeColor: openCount > 0 ? '#991B1B' : '#075985',
      badgeBorder: openCount > 0 ? '#FECACA' : '#BAE6FD',
      sub: 'Action Needed',
    },
    {
      key: 'resolved' as StatusFilterType,
      value: resolvedCount,
      label: 'Resolved',
      icon: icons.check,
      iconBg: '#ECFDF8',
      iconColor: '#0F8A67',
      badgeBg: '#F0FDF4',
      badgeColor: '#065F46',
      badgeBorder: '#BBF7D0',
      sub: 'Completed',
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
            Resident Support
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.ink, letterSpacing: '-0.02em', marginTop: 2 }}>
            Maintenance Requests &amp; Tickets
          </div>
          <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
            Track technician dispatch, repair status, and report new issues
          </div>
        </div>

        <Link
          to="/tenant/dashboard?new=1"
          className="gfh-portal-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: '#0E5E48',
            color: '#FFFFFF',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(14, 94, 72, 0.25)',
          }}
        >
          <Icon path={icons.plus} size={16} />
          New Complaint
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
        {statCards.map((card, i) => {
          const isSelected = statusFilter === card.key
          return (
            <div
              key={card.label}
              onClick={() => setStatusFilter(card.key)}
              className="gfh-portal-stat"
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '20px 22px',
                border: isSelected ? '2px solid #0E5E48' : '1px solid #E2E8F0',
                boxShadow: isSelected ? '0 6px 16px rgba(14, 94, 72, 0.12)' : '0 1px 3px rgba(16,24,40,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 128,
                cursor: 'pointer',
                animationDelay: `${i * 0.06}s`,
                transition: 'all 0.18s ease',
              }}
              title={`Filter by ${card.label}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: card.iconBg,
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
                  {isLoading ? '—' : card.value}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: isSelected ? '#0E5E48' : '#64748B', marginTop: 4 }}>
                  {card.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter Tabs & Search Bar */}
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
            { key: 'all' as StatusFilterType, label: 'All Tickets', count: complaints.length },
            { key: 'open' as StatusFilterType, label: 'Open', count: openCount, dot: '#DC2626' },
            { key: 'in_progress' as StatusFilterType, label: 'In Progress', count: inProgressCount, dot: '#0284C7' },
            { key: 'resolved' as StatusFilterType, label: 'Resolved', count: resolvedCount, dot: '#059669' },
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

        {/* Real-time Search */}
        <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
            <Icon path={icons.search} size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tickets by issue or ID..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: 12.5,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Main Complaints List Panel */}
      <div className="fade-in" style={{ ...panelStyle, minHeight: 280, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: THEME.ink, margin: 0 }}>
            Maintenance Tickets
          </h3>
          <div style={{ fontSize: 12, color: '#64748B' }}>
            {filteredComplaints.length} tickets matching filter
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : filteredComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F8FAFC', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon path={icons.wrench} size={22} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: THEME.ink, margin: 0 }}>
              {searchQuery || statusFilter !== 'all'
                ? 'No maintenance complaints match the current filter.'
                : 'No maintenance complaints submitted yet.'}
            </p>
            <p style={{ fontSize: 12.5, color: THEME.textMuted, marginTop: 4 }}>
              If you experience any issues in your unit, submit a new complaint.
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                style={{
                  marginTop: 14,
                  padding: '8px 16px',
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
                  <th style={thStyle}>Ticket ID</th>
                  <th style={thStyle}>Issue Title &amp; Description</th>
                  <th style={thStyle}>Priority</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Submitted</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(item => {
                  const st = STATUS_STYLE[item.status] || STATUS_STYLE.open
                  const pr = PRIORITY_STYLE[item.priority?.toLowerCase() || ''] || PRIORITY_STYLE.low

                  return (
                    <tr key={item.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 800 }}>
                        <span style={{ background: '#F1F5F9', color: '#0F172A', padding: '3px 8px', borderRadius: 6, fontSize: 12 }}>
                          #TKT-{String(item.id).padStart(4, '0')}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 700, color: THEME.ink, fontSize: 14 }}>{item.title}</div>
                        {item.description && (
                          <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3, maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {item.priority ? (
                          <span style={{ background: pr.bg, color: pr.color, border: `1px solid ${pr.border}`, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            {safeUpper(item.priority)}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94A3B8' }}>Standard</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                          {safeUpperLabel(item.status)}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: 12, color: '#475569', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {formatDubaiDateTime(item.created_at)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <Link
                          to={`/tenant/complaints/${item.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: '#F0F9FF',
                            color: '#0284C7',
                            border: '1px solid #BAE6FD',
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          Details
                          <Icon path={icons.arrowRight} size={12} />
                        </Link>
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
