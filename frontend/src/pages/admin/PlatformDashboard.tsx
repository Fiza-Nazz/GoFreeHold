import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPlatformDashboard } from '../../api/platform'
import type { PlatformDashboardStats } from '../../types/platform'
import { THEME, portalPageCss } from '../../components/gfh/adminTheme'

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  padding: '18px 20px',
  boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
}

type StatCard = {
  label: string
  value: number
  to?: string
  color: string
  hint?: string
}

function StatGrid({ cards }: { cards: StatCard[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
      {cards.map((card) => {
        const inner = (
          <div style={cardStyle}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {card.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: card.color, marginTop: 8 }}>
              {Number(card.value).toLocaleString()}
            </div>
            {card.hint && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#94A3B8' }}>{card.hint}</div>
            )}
          </div>
        )
        return card.to ? (
          <Link key={card.label} to={card.to} style={{ textDecoration: 'none' }}>{inner}</Link>
        ) : (
          <div key={card.label}>{inner}</div>
        )
      })}
    </div>
  )
}

export default function PlatformDashboard() {
  const [stats, setStats] = useState<PlatformDashboardStats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchPlatformDashboard()
      .then((data) => {
        if (alive) setStats(data)
      })
      .catch((err: any) => {
        if (alive) {
          setError(err.response?.data?.message || 'Unable to load platform dashboard. Ensure /admin/dashboard is available.')
        }
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const accountCards: StatCard[] = [
    { label: 'Organizations', value: stats?.total_organizations ?? 0, to: '/admin/organizations', color: '#0F766E', hint: `${stats?.active_organizations ?? 0} active` },
    { label: 'Trials', value: stats?.trial_organizations ?? 0, to: '/admin/organizations?status=trial', color: '#2563EB' },
    { label: 'Suspended', value: stats?.suspended_organizations ?? 0, to: '/admin/organizations?status=suspended', color: '#DC2626' },
    { label: 'MRR (AED)', value: stats?.subscription_mrr ?? 0, to: '/admin/plans', color: '#059669' },
  ]

  const peopleCards: StatCard[] = [
    { label: 'Owners', value: stats?.total_owners ?? 0, to: '/admin/users', color: '#7C3AED' },
    { label: 'Staff Users', value: stats?.total_staff ?? 0, to: '/admin/users', color: '#4F46E5', hint: 'Cashiers / accountants / maintenance' },
    { label: 'Tenants', value: stats?.total_tenants ?? 0, color: '#0891B2' },
    { label: 'Active Users', value: stats?.active_users ?? 0, to: '/admin/users', color: '#0EA5E9' },
  ]

  const portfolioCards: StatCard[] = [
    { label: 'Properties', value: stats?.total_properties ?? 0, color: '#B45309' },
    { label: 'Units', value: stats?.total_units ?? 0, color: '#C2410C' },
    { label: 'Occupied Units', value: stats?.occupied_units ?? 0, color: '#16A34A' },
    { label: 'Vacant Units', value: stats?.vacant_units ?? 0, color: '#CA8A04' },
    { label: 'Contracts', value: stats?.total_contracts ?? 0, color: '#334155' },
    { label: 'Active Contracts', value: stats?.active_contracts ?? 0, color: '#065F46' },
  ]

  return (
    <div>
      <style>{portalPageCss}</style>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: THEME.ink }}>Platform Dashboard</h1>
        <p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 14 }}>
          Cross-customer SaaS overview — accounts, people, and portfolio volume
        </p>
      </div>

      {error && (
        <div style={{ ...cardStyle, borderColor: '#FECACA', background: '#FEF2F2', color: '#991B1B', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, color: THEME.textMuted }}>Loading platform metrics...</div>
      ) : (
        <>
          <section style={{ marginBottom: 22 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: THEME.ink }}>Accounts & billing</h2>
            <StatGrid cards={accountCards} />
          </section>

          <section style={{ marginBottom: 22 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: THEME.ink }}>People across the platform</h2>
            <StatGrid cards={peopleCards} />
          </section>

          <section style={{ marginBottom: 22 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: THEME.ink }}>Portfolio volume</h2>
            <StatGrid cards={portfolioCards} />
          </section>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: THEME.ink }}>Recent security activity</h2>
              <Link to="/admin/audit-logs" style={{ color: '#0F766E', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                View all
              </Link>
            </div>
            {(stats?.recent_audit || []).length === 0 ? (
              <p style={{ margin: 0, color: THEME.textMuted, fontSize: 13 }}>No recent audit events.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(stats?.recent_audit || []).slice(0, 8).map((log) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #F1F5F9', paddingBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: THEME.ink, fontSize: 13 }}>{log.action}</div>
                      <div style={{ color: '#64748B', fontSize: 12 }}>
                        {log.actor?.name || 'System'}
                        {log.organization?.name ? ` ┬╖ ${log.organization.name}` : ''}
                      </div>
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
