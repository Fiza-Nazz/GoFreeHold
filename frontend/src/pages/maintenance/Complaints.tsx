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
  tenant?: { name: string }
}

const icons = {
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
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

/** Live APIs: GET /maintenance/complaints, POST /maintenance/complaints/{id}/status */
export default function MaintenanceComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Assigned complaints</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Live work queue</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>From your maintenance assignments</div>
        </div>
        <button className="gfh-portal-btn" onClick={fetchComplaints} disabled={isLoading} style={{ ...ghostBtnStyle, background: '#075985', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          <Icon path={icons.refresh} size={16} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
        {[
          { value: complaints.length, label: 'Total complaints', bg: '#1e1b4b', sub: 'Total' },
          { value: openCount, label: 'Open queue', bg: openCount > 0 ? '#991b1b' : '#075985', sub: 'Open' },
          { value: inProgressCount, label: 'In progress', bg: '#b45309', sub: 'Active' },
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
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No complaints assigned.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['ID', 'Issue', 'Unit', 'Tenant', 'Priority', 'Status', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => {
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
                        <br />
                        <span style={{ fontSize: 12, color: THEME.textMuted }}>{c.unit?.property?.name || ''}</span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{c.tenant?.name || '—'}</td>
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
                              Start
                            </button>
                          )}
                          {c.status !== 'resolved' && (
                            <button
                              className="gfh-portal-btn"
                              onClick={() => handleStatusUpdate(c.id, 'resolved')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 12, fontWeight: 700, borderRadius: 0, background: '#065f46', color: '#fff', border: 'none', cursor: 'pointer' }}
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
