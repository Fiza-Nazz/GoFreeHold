import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Link } from 'react-router-dom'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'
import { safeUpperLabel } from '../../utils/safeLabel'

interface Complaint {
  id: number
  title: string
  status: string
  created_at: string
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  ticket: 'M15 5v2M15 11v2M15 17v2M5 5a2 2 0 0 0-2 2v3a2 2 0 1 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 1 1 0-4V7a2 2 0 0 0-2-2H5z',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  check: 'M20 6 9 17l-5-5',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  resolved:    { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
  in_progress: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  open:        { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  assigned:    { bg: '#f0f9ff', color: '#075985', border: '#bae6fd' },
}

export default function TenantComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length

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
      label: 'Open / active',
      icon: icons.inbox,
      iconBg: openCount > 0 ? '#FEF2F2' : '#F0F9FF',
      iconColor: openCount > 0 ? '#DC2626' : '#0284C7',
      badgeBg: openCount > 0 ? '#FEF2F2' : '#F0F9FF',
      badgeColor: openCount > 0 ? '#991B1B' : '#075985',
      badgeBorder: openCount > 0 ? '#FECACA' : '#BAE6FD',
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
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>My Complaints</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Maintenance Requests</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Track your maintenance requests</div>
        </div>
        <Link
          to="/tenant/dashboard?new=1"
          className="gfh-portal-btn"
          style={{
            ...ghostBtnStyle,
            background: '#0E5E48',
            borderRadius: 8,
          }}
        >
          <Icon path={icons.plus} size={16} />
          New Complaint
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
        {statCards.map((card, i) => (
          <div
            key={card.label}
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
              animationDelay: `${i * 0.06}s`,
            }}
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
                {isLoading ? '—' : card.value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 280 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No maintenance complaints submitted yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['ID', 'Issue', 'Status', 'Logged', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.map(item => {
                  const st = STATUS_STYLE[item.status] || STATUS_STYLE.open
                  return (
                    <tr key={item.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>#{item.id}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{item.title}</td>
                      <td style={tdStyle}>
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, display: 'inline-block' }}>
                          {safeUpperLabel(item.status)}
                        </span>
                      </td>
                      <td style={tdStyle}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                      <td style={tdStyle}>
                        <Link to={`/tenant/complaints/${item.id}`} className="gfh-portal-link" style={{ color: '#0E5E48' }}>View details →</Link>
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
