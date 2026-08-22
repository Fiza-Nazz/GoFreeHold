import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts'
import api from '../../api/axios'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, RADIUS } from '../../components/gfh/adminTheme'

interface PortfolioSummary {
  total_properties: number
  total_units: number
  occupied_units: number
  vacant_units: number
  booked_units: number
}

const icons = {
  building: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6',
  door: 'M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 21v-6h6v6M9 9h.01M15 9h.01',
  check: 'M20 6 9 17l-5-5',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
}

export default function OwnerDashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/owner/dashboard/summary')
        setSummary(res.data.data.portfolio)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (isLoading) {
    return (
      <div className="gfh-portal-page" style={{ padding: 40, textAlign: 'center' }}>
        <style>{portalPageCss}</style>
        <span className="spinner" />
      </div>
    )
  }

  const chartData = [
    { name: 'Occupied', value: summary?.occupied_units || 0, color: '#065f46' },
    { name: 'Vacant', value: summary?.vacant_units || 0, color: '#991b1b' },
    { name: 'Booked', value: summary?.booked_units || 0, color: '#b45309' },
  ].filter(item => item.value > 0)

  const stats = [
    { value: summary?.total_properties ?? 0, label: 'Total properties', sub: 'Portfolio', bg: '#1e1b4b', icon: icons.building },
    { value: summary?.total_units ?? 0, label: 'Total units', sub: 'Units', bg: '#075985', icon: icons.door },
    { value: summary?.occupied_units ?? 0, label: 'Occupied units', sub: 'Occupied', bg: '#065f46', icon: icons.check },
    { value: summary?.vacant_units ?? 0, label: 'Vacant units', sub: 'Available', bg: '#991b1b', icon: icons.alert },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Owner dashboard</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Your property portfolio at a glance</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Live occupancy and portfolio counts</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/owner/properties" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#1e1b4b' }}>
            View properties
          </Link>
          <Link to="/owner/vacant-units" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#b45309' }}>
            Vacant units
          </Link>
        </div>
      </div>

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
              minHeight: 118,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)',
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{card.value}</div>
              <Icon path={card.icon} size={18} />
            </div>
            <div>
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
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 18 }}>
        <div className="fade-in" style={{ ...panelStyle, minHeight: 350 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.ink, marginTop: 0, marginBottom: 18 }}>
            Occupancy overview
          </h3>
          {chartData.length > 0 ? (
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#fff', borderColor: THEME.border, borderRadius: RADIUS }} itemStyle={{ color: THEME.ink }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No unit data available</p>
            </div>
          )}
        </div>

        <div className="fade-in" style={{ ...panelStyle, minHeight: 350 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.ink, marginTop: 0, marginBottom: 18 }}>
            Quick actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { to: '/owner/properties', title: 'Property drill-down', desc: 'View detailed stats for each property' },
              { to: '/owner/vacant-units', title: 'Vacant units report', desc: 'Filter and list all currently available units' },
              { to: '/owner/ledger', title: 'Rent ledger', desc: 'Debit / credit history across your contracts' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="gfh-portal-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 16,
                  background: '#fff',
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 0,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <strong style={{ fontSize: 14, fontWeight: 700, color: THEME.ink }}>{item.title}</strong>
                  <p style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500, marginTop: 2, marginBottom: 0 }}>{item.desc}</p>
                </div>
                <span style={{ color: '#075985', fontWeight: 700 }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
