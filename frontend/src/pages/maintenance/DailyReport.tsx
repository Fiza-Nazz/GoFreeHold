import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, RADIUS } from '../../components/gfh/adminTheme'

const icons = {
  inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  progress: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
  check: 'M20 6 9 17l-5-5',
  ticket: 'M15 5v2M15 11v2M15 17v2M5 5a2 2 0 0 0-2 2v3a2 2 0 1 1 0 4v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 1 1 0-4V7a2 2 0 0 0-2-2H5z',
}

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
    {
      label: 'Open queue',
      value: stats.open ?? 0,
      icon: icons.inbox,
      iconBg: (stats.open ?? 0) > 0 ? '#FEF2F2' : '#F0F9FF',
      iconColor: (stats.open ?? 0) > 0 ? '#DC2626' : '#0284C7',
      badgeBg: (stats.open ?? 0) > 0 ? '#FEF2F2' : '#F0F9FF',
      badgeColor: (stats.open ?? 0) > 0 ? '#991B1B' : '#075985',
      badgeBorder: (stats.open ?? 0) > 0 ? '#FECACA' : '#BAE6FD',
      sub: 'Open',
    },
    {
      label: 'In progress',
      value: stats.in_progress ?? 0,
      icon: icons.progress,
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
      badgeBg: '#FFFBEB',
      badgeColor: '#B45309',
      badgeBorder: '#FDE68A',
      sub: 'Active',
    },
    {
      label: 'Resolved today',
      value: stats.resolved_today ?? 0,
      icon: icons.check,
      iconBg: '#ECFDF8',
      iconColor: '#0F8A67',
      badgeBg: '#F0FDF4',
      badgeColor: '#065F46',
      badgeBorder: '#BBF7D0',
      sub: 'Done',
    },
    {
      label: 'Total assigned',
      value: stats.total ?? stats.assigned ?? '—',
      icon: icons.ticket,
      iconBg: '#ECFDF8',
      iconColor: '#0E5E48',
      badgeBg: '#ECFDF8',
      badgeColor: '#065F46',
      badgeBorder: '#A7F3DC',
      sub: 'Total',
    },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: THEME.pageBg }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {cards.map((card, i) => (
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
                  {card.value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                  {card.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
