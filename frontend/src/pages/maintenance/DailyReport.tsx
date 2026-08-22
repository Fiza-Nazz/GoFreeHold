import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, ADMIN_COLORS, portalPageCss, heroStyle, panelStyle, RADIUS } from '../../components/gfh/adminTheme'

/** Live API: GET /maintenance/daily-report */
export default function MaintenanceDailyReport() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get('/maintenance/daily-report')
        setData(res.data?.data || null)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load daily report')
        setData(null)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const stats = data?.stats || {}

  const cards = [
    { label: 'Open', value: stats.open ?? 0, bg: (stats.open ?? 0) > 0 ? '#991b1b' : '#075985', sub: 'Open' },
    { label: 'In progress', value: stats.in_progress ?? 0, bg: '#b45309', sub: 'Active' },
    { label: 'Resolved today', value: stats.resolved_today ?? 0, bg: '#065f46', sub: 'Done' },
    { label: 'Total assigned', value: stats.total ?? stats.assigned ?? '—', bg: '#1e1b4b', sub: 'Total' },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Daily report</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Today&apos;s completion stats</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Live maintenance metrics for today</div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
      ) : error ? (
        <div style={{ ...panelStyle, color: ADMIN_COLORS.red, fontWeight: 600, minHeight: 120 }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {cards.map((card, i) => (
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
      )}
    </div>
  )
}
