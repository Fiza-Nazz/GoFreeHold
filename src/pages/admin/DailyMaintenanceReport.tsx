import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

interface ReportData {
  report_date: string
  stats: {
    open: number
    assigned: number
    in_progress: number
    resolved_today: number
  }
  completed_jobs: Array<{
    id: number
    complaint?: { title: string; unit?: { number: string; property?: { name: string } } }
    assignedTo?: { name: string }
    completed_at: string
  }>
}

const icons = {
  open: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  assigned: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  progress: 'M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
  resolved: 'm20 6-11 11-5-5',
  refresh: 'M21 12a9 9 0 0 1-15.3 6.4M3 12a9 9 0 0 1 15.3-6.4M21 3v6h-6M3 21v-6h6',
}

export default function DailyMaintenanceReport() {
  const [report, setReport] = useState<ReportData | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [selectedDate])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`/admin/maintenance/daily-report?date=${selectedDate}`)
      setReport(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const totalJobs = report ? report.stats.open + report.stats.assigned + report.stats.in_progress + report.stats.resolved_today : 0
  const resolvedPct = totalJobs > 0 && report ? Math.round((report.stats.resolved_today / totalJobs) * 100) : 0

  const statCards = report ? [
    { value: report.stats.open, label: 'Open complaints', color: '#dc2626', icon: icons.open, iconBg: 'linear-gradient(135deg, #f87171, #b91c1c)' },
    { value: report.stats.assigned, label: 'Assigned jobs', color: '#c2410c', icon: icons.assigned, iconBg: 'linear-gradient(135deg, #fb923c, #c2410c)' },
    { value: report.stats.in_progress, label: 'In progress', color: '#2563eb', icon: icons.progress, iconBg: 'linear-gradient(135deg, #60a5fa, #2563eb)' },
    { value: report.stats.resolved_today, label: `Resolved on ${selectedDate}`, color: '#059669', icon: icons.resolved, iconBg: 'linear-gradient(135deg, #22c55e, #15803d)' },
  ] : []

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Daily maintenance report
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Daily completion metrics and active maintenance summary
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{
              width: 170,
              borderRadius: 0,
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              padding: '10px 12px',
            }}
          />
          <button
            onClick={fetchReport}
            title="Refresh report"
            className="gfh-portal-btn"
            style={{
              width: 38,
              height: 38,
              borderRadius: 0,
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon path={icons.refresh} size={16} />
          </button>
        </div>
      </div>

      {isLoading && !report ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 22 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ height: 116, border: `1px solid ${THEME.border}`, background: '#f6f1fe' }} />
          ))}
        </div>
      ) : report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 22 }}>
          {statCards.map((card, i) => (
            <div key={card.label} className="gfh-portal-stat fade-in" style={{ position: 'relative', background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 0, padding: 20, animationDelay: `${i * 0.06}s` }}>
              <CornerBrackets />
              <div style={{ width: 40, height: 40, borderRadius: 0, background: card.iconBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon path={card.icon} size={18} />
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {report && totalJobs > 0 && (
        <div className="fade-in" style={{ ...panelStyle, minHeight: 0, padding: '18px 22px', marginBottom: 22 }}>
          <CornerBrackets />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.purple, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Resolution rate</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>{resolvedPct}%</span>
          </div>
          <div style={{ width: '100%', height: 8, background: '#e5e7eb', overflow: 'hidden' }}>
            <div style={{ width: `${resolvedPct}%`, height: '100%', background: `linear-gradient(90deg, ${THEME.violet}, #059669)`, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 500, marginTop: 8 }}>
            {report.stats.resolved_today} of {totalJobs} tracked jobs resolved today
          </div>
        </div>
      )}

      <div className="fade-in" style={{ ...panelStyle, minHeight: 300 }}>
        <CornerBrackets />
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: THEME.purple, marginBottom: 18, marginTop: 0 }}>
          Completed jobs on {selectedDate}
        </h3>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : !report?.completed_jobs || report.completed_jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No maintenance jobs completed on this date.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Job ID', 'Complaint', 'Unit / Building', 'Technician', 'Completed time'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.completed_jobs.map(job => (
                  <tr key={job.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: THEME.violetLight }}>#JOB-{job.id}</td>
                    <td style={tdStyle}>{job.complaint?.title}</td>
                    <td style={tdStyle}>
                      {job.complaint?.unit?.number} <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 500 }}>({job.complaint?.unit?.property?.name})</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{job.assignedTo?.name || 'N/A'}</td>
                    <td style={{ ...tdStyle, color: '#059669', fontWeight: 700 }}>{new Date(job.completed_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
