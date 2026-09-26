import { useEffect, useState, useMemo } from 'react'
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
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
}

export default function DailyMaintenanceReport() {
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  const [report, setReport] = useState<ReportData | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReport()
  }, [selectedDate])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`${basePath}/maintenance/daily-report?date=${selectedDate}`)
      setReport(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const handlePrint = () => {
    window.print()
  }

  const totalJobs = report ? report.stats.open + report.stats.assigned + report.stats.in_progress + report.stats.resolved_today : 0
  const resolvedPct = totalJobs > 0 && report ? Math.round((report.stats.resolved_today / totalJobs) * 100) : 0

  const statCards = report ? [
    { value: report.stats.open, label: 'Open complaints', color: '#dc2626', icon: icons.open, iconBg: '#dc2626', cardBg: '#FEF2F2', cardBorder: '#FECACA' },
    { value: report.stats.assigned, label: 'Assigned jobs', color: '#c2410c', icon: icons.assigned, iconBg: '#c2410c', cardBg: '#FFF7ED', cardBorder: '#FED7AA' },
    { value: report.stats.in_progress, label: 'In progress', color: '#0284c7', icon: icons.progress, iconBg: '#0284c7', cardBg: '#F0F9FF', cardBorder: '#BAE6FD' },
    { value: report.stats.resolved_today, label: `Resolved today`, color: '#059669', icon: icons.resolved, iconBg: '#059669', cardBg: '#F0FDF4', cardBorder: '#BBF7D0' },
  ] : []

  const filteredJobs = useMemo(() => {
    const list = report?.completed_jobs || []
    if (!searchTerm.trim()) return list
    const q = searchTerm.toLowerCase()
    return list.filter(j => {
      const title = (j.complaint?.title || '').toLowerCase()
      const unit = (j.complaint?.unit?.number || '').toLowerCase()
      const prop = (j.complaint?.unit?.property?.name || '').toLowerCase()
      const tech = (j.assignedTo?.name || '').toLowerCase()
      const idStr = String(j.id)
      return title.includes(q) || unit.includes(q) || prop.includes(q) || tech.includes(q) || idStr.includes(q)
    })
  }, [report?.completed_jobs, searchTerm])

  return (
    <div className="gfh-portal-page gfh-dm-page" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`${portalPageCss}
        .gfh-dm-print-only { display: none; }

        @media print {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          @page { margin: 12mm 14mm; size: auto; }
          body { background: #ffffff !important; color: #0f172a !important; }
          nav, aside, header, .gfh-dm-noprint { display: none !important; }
          .gfh-portal-page, .gfh-dm-page { padding: 0 !important; margin: 0 !important; background: #ffffff !important; }
          .gfh-dm-printable { position: static !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
          .gfh-dm-print-only { display: block !important; }
          .gfh-dm-letterhead {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            gap: 16px !important;
            padding-bottom: 14px !important;
            margin-bottom: 18px !important;
            border-bottom: 2px solid #0e5e48 !important;
          }
          .gfh-dm-brand-row { display: flex !important; align-items: center !important; gap: 10px !important; }
          .gfh-dm-brand-mark {
            width: 32px !important; height: 32px !important; border-radius: 6px !important;
            background: #0e5e48 !important; color: #fff !important; display: flex !important;
            align-items: center !important; justify-content: center !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important; font-weight: 800 !important; font-size: 16px !important;
          }
          .gfh-dm-brand-text h2 { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important; font-size: 16px !important; font-weight: 800 !important; margin: 0 !important; }
          .gfh-dm-brand-text span { font-size: 9.5px !important; font-weight: 700 !important; color: #0e5e48 !important; text-transform: uppercase !important; }
          .gfh-dm-print-only h1 { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important; font-size: 20px !important; font-weight: 800 !important; margin: 0 0 4px 0 !important; text-align: right !important; }
          .gfh-dm-print-only p { font-size: 10px !important; color: #64748b !important; margin: 0 !important; text-align: right !important; }
          table { width: 100% !important; border-collapse: collapse !important; page-break-inside: auto !important; }
          thead { display: table-header-group !important; }
          tr { page-break-inside: avoid !important; page-break-after: auto !important; }
          thead tr { background: #f1f5f9 !important; }
          th { text-align: left !important; color: #1e293b !important; font-size: 9.5px !important; font-weight: 700 !important; text-transform: uppercase !important; padding: 8px 10px !important; border-bottom: 2px solid #cbd5e1 !important; }
          td { text-align: left !important; color: #0f172a !important; font-size: 10px !important; padding: 8px 10px !important; border-bottom: 1px solid #e2e8f0 !important; }
          tbody tr:nth-child(even) { background: #f8fafc !important; }
        }
      `}</style>

      {/* Hero Header */}
      <div className="fade-in gfh-dm-noprint" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Daily Maintenance Report
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Daily resolution metrics, field workload summary, and completed work orders
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: 8, padding: '4px 8px', gap: 6 }}>
            <Icon path={icons.calendar} size={15} />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#0F172A',
                fontSize: 13,
                fontWeight: 600,
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
              }}
            />
          </div>

          <button
            onClick={handleSetToday}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Today
          </button>

          <button
            onClick={fetchReport}
            title="Refresh Report"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon path={icons.refresh} size={15} />
          </button>

          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#0E5E48',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '9px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
              transition: 'background 0.15s ease',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Icon path={icons.printer} size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="gfh-dm-printable">
        {/* Letterhead (Print Only) */}
        <div className="gfh-dm-print-only gfh-dm-letterhead">
          <div className="gfh-dm-brand-row">
            <div className="gfh-dm-brand-mark">G</div>
            <div className="gfh-dm-brand-text">
              <h2>GoFreeHold</h2>
              <span>Maintenance & Facility Operations</span>
            </div>
          </div>
          <div>
            <h1>Daily Maintenance Report</h1>
            <p>Date: {selectedDate} | Generated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        {isLoading && !report ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ height: 110, border: `1px solid ${THEME.border}`, background: '#f8fafc', borderRadius: 10 }} />
            ))}
          </div>
        ) : report && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
            {statCards.map((card, i) => (
              <div key={card.label} className="gfh-portal-stat fade-in" style={{ position: 'relative', background: card.cardBg, border: `1px solid ${card.cardBorder}`, borderRadius: 12, padding: 20, animationDelay: `${i * 0.05}s` }}>
                <CornerBrackets />
                <div style={{ width: 38, height: 38, borderRadius: 8, background: card.iconBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon path={card.icon} size={18} />
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 800, color: card.color }}>
                  {card.value}
                </div>
                <div style={{ fontSize: 11.5, color: card.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 2 }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resolution Rate Progress Card */}
        {report && totalJobs > 0 && (
          <div className="fade-in" style={{ ...panelStyle, minHeight: 0, padding: '18px 22px', marginBottom: 22, borderRadius: 10 }}>
            <CornerBrackets />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0E5E48', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Daily Resolution Velocity
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#059669' }}>
                {resolvedPct}% Completed
              </span>
            </div>
            <div style={{ width: '100%', height: 9, background: '#E2E8F0', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ width: `${resolvedPct}%`, height: '100%', background: 'linear-gradient(90deg, #0E5E48, #10B981)', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 500, marginTop: 8 }}>
              <strong>{report.stats.resolved_today}</strong> of <strong>{totalJobs}</strong> total tracked complaints resolved on {selectedDate}
            </div>
          </div>
        )}

        {/* Completed Jobs Table Panel */}
        <div className="fade-in" style={{ ...panelStyle, minHeight: 320, padding: 24, borderRadius: 10 }}>
          <CornerBrackets />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
            <h3 style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontSize: 18, fontWeight: 700, color: THEME.ink, margin: 0 }}>
              Completed Jobs on {selectedDate} ({filteredJobs.length})
            </h3>

            {/* Table Search */}
            <div className="gfh-dm-noprint" style={{ position: 'relative', minWidth: 260, flex: '1 1 240px', maxWidth: 360 }}>
              <input
                type="text"
                placeholder="Search job #, complaint, unit, tech..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  fontSize: 12.5,
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
                <Icon path={icons.search} size={14} />
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    fontSize: 14,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <span className="spinner" /> Loading daily report...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 50 }}>
              <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>
                {searchTerm ? 'No completed jobs matching your search criteria.' : `No maintenance jobs recorded as completed on ${selectedDate}.`}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${THEME.border}`, background: '#F8FAFC' }}>
                    {['Job ID', 'Complaint Title', 'Unit & Building', 'Assigned Technician', 'Completed At', 'Status'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map(job => (
                    <tr key={job.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#0E5E48', whiteSpace: 'nowrap' }}>
                        #JOB-{String(job.id).padStart(4, '0')}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: THEME.ink }}>
                        {job.complaint?.title || 'Maintenance Task'}
                      </td>
                      <td style={tdStyle}>
                        {job.complaint?.unit ? (
                          <div>
                            <span style={{ fontWeight: 600, color: '#0E5E48' }}>Unit {job.complaint.unit.number}</span>
                            {job.complaint.unit.property?.name && (
                              <span style={{ fontSize: 11.5, color: '#64748B', display: 'block' }}>
                                {job.complaint.unit.property.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          'General Facility'
                        )}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#334155' }}>
                        {job.assignedTo?.name || 'Unassigned Squad'}
                      </td>
                      <td style={{ ...tdStyle, color: '#475569', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                        {new Date(job.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 9px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: '#DCFCE7',
                          color: '#15803D',
                          border: '1px solid #BBF7D0',
                          whiteSpace: 'nowrap',
                        }}>
                          COMPLETED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

