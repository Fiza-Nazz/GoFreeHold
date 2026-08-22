import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { safeUpper, safeUpperLabel } from '../../utils/safeLabel'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle, RADIUS } from '../../components/gfh/adminTheme'

interface Complaint {
  id: number
  title: string
  description: string
  status: string
  priority: string
  unit?: { number: string; property?: { name: string } }
  tenant?: { name: string; phone?: string }
}

const icons = {
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  ticket: 'M15 5v2M15 11v2M15 17v2M5 5a2 2 0 0 0-2 2v3a2 2 0 1 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 1 1 0-4V7a2 2 0 0 0-2-2H5z',
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  progress: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
  check: 'M20 6 9 17l-5-5',
  play: 'M5 3l14 9-14 9V3z',
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

export default function MaintenanceDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [dailyReport, setDailyReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [cRes, rRes] = await Promise.all([
        api.get('/maintenance/complaints'),
        api.get('/maintenance/daily-report'),
      ])
      setComplaints(cRes.data.data.complaints || [])
      setDailyReport(rRes.data.data)
    } catch (err) {
      console.error('Error loading maintenance data', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      await api.post(`/maintenance/complaints/${id}/status`, { status: newStatus })
      fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update complaint status.')
    }
  }

  const stats = [
    { value: complaints.length, label: 'Assigned complaint tickets', bg: '#1e1b4b', sub: 'Tickets' },
    { value: dailyReport?.stats?.open || 0, label: 'Open / unassigned queue', bg: (dailyReport?.stats?.open || 0) > 0 ? '#991b1b' : '#075985', sub: 'Open' },
    { value: dailyReport?.stats?.in_progress || 0, label: 'In progress jobs', bg: '#b45309', sub: 'Active' },
    { value: dailyReport?.stats?.resolved_today || 0, label: 'Resolved today', bg: '#065f46', sub: 'Done' },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Maintenance work portal</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Track assigned complaints & jobs</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Job status and daily completion logs</div>
        </div>
        <button className="gfh-portal-btn" onClick={fetchData} disabled={isLoading} style={{ ...ghostBtnStyle, background: '#075985', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          <Icon path={icons.refresh} size={16} />
          Refresh tasks
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
            {stats.map((card, i) => (
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
                <div style={{ fontSize: 28, fontWeight: 800 }}>{card.value}</div>
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

          <div className="fade-in" style={{ ...panelStyle, minHeight: 320 }}>
            {complaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>
                  No active maintenance tickets assigned to you at the moment.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                      {['Ticket ID', 'Title / issue', 'Unit & building', 'Tenant', 'Priority', 'Status', 'Actions'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => {
                      const pr = PRIORITY_STYLE[c.priority] || PRIORITY_STYLE.low
                      const st = STATUS_STYLE[c.status] || STATUS_STYLE.open
                      return (
                        <tr key={c.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>#TKT-{String(c.id).padStart(4, '0')}</td>
                          <td style={tdStyle}>
                            <strong style={{ fontWeight: 700, color: THEME.ink }}>{c.title}</strong>
                            <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>{c.description}</div>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>
                            {c.unit?.number || '—'}
                            <br />
                            <span style={{ fontSize: 12, color: THEME.textMuted }}>{c.unit?.property?.name || ''}</span>
                          </td>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{c.tenant?.name || 'N/A'}</td>
                          <td style={tdStyle}>
                            <span style={{ backgroundColor: pr.bg, color: pr.color, border: `1px solid ${pr.border}`, padding: '4px 10px', borderRadius: 0, fontSize: 12, fontWeight: 700 }}>
                              {safeUpper(c.priority)}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <span style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '4px 10px', borderRadius: 0, fontSize: 12, fontWeight: 700 }}>
                              {safeUpperLabel(c.status)}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {c.status !== 'in_progress' && c.status !== 'resolved' && (
                                <button
                                  className="gfh-portal-btn"
                                  onClick={() => handleStatusUpdate(c.id, 'in_progress')}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 12, fontWeight: 700, borderRadius: 0, background: '#075985', color: '#fff', border: 'none', cursor: 'pointer' }}
                                >
                                  <Icon path={icons.play} size={12} />
                                  Start job
                                </button>
                              )}
                              {c.status !== 'resolved' && (
                                <button
                                  className="gfh-portal-btn"
                                  onClick={() => handleStatusUpdate(c.id, 'resolved')}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 12, fontWeight: 700, borderRadius: 0, background: '#065f46', color: '#fff', border: 'none', cursor: 'pointer' }}
                                >
                                  <Icon path={icons.check} size={12} />
                                  Mark resolved
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
        </>
      )}
    </div>
  )
}
