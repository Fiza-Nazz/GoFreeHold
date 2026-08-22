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

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>My Complaints</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Maintenance Requests</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Track your maintenance requests</div>
        </div>
        <Link to="/tenant/dashboard?new=1" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#1e1b4b' }}>
          <Icon path={icons.plus} size={16} />
          New Complaint
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
        {[
          { value: complaints.length, label: 'Total complaints', bg: '#1e1b4b', sub: 'Total' },
          { value: openCount, label: 'Open / active', bg: openCount > 0 ? '#991b1b' : '#075985', sub: 'Active' },
          { value: resolvedCount, label: 'Resolved', bg: '#065f46', sub: 'Done' },
        ].map((card, i) => (
          <div
            key={card.label}
            className="gfh-portal-stat"
            style={{
              background: card.bg,
              color: '#fff',
              borderRadius: 0,
              padding: '20px 18px',
              minHeight: 110,
              boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)',
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800 }}>{isLoading ? '—' : card.value}</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>{card.label}</div>
            <div style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.18)',
              padding: '3px 8px',
              borderRadius: 0,
            }}>
              {card.sub}
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
                        <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '4px 10px', borderRadius: 0, fontSize: 12, fontWeight: 700 }}>
                          {safeUpperLabel(item.status)}
                        </span>
                      </td>
                      <td style={tdStyle}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                      <td style={tdStyle}>
                        <Link to={`/tenant/complaints/${item.id}`} className="gfh-portal-link" style={{ color: '#075985' }}>View details →</Link>
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
