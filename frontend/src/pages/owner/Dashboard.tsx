import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../../api/axios'
import {
  Icon,
  ICONS,
  THEME,
  portalPageCss,
} from '../../components/gfh/adminTheme'
import { formatDate } from '../../utils/formatDate'
import { getDefaultUnitImageUrl } from '../../utils/unitImages'

interface PortfolioSummary {
  total_properties: number
  total_units: number
  occupied_units: number
  vacant_units: number
  booked_units: number
}

interface PropertyItem {
  id: number
  name: string
  address?: string
  type?: string
  image_url?: string
  total_units?: number
}

interface PaymentItem {
  id: number
  amount: number | string
  payment_date?: string
  date?: string
  created_at?: string
  type?: string
  status?: string
  contract?: {
    unit?: {
      number?: string
      property?: { name?: string }
    }
    tenant?: { name?: string }
  }
  tenant?: { name?: string }
}

interface ContractItem {
  id: number
  unit_id: number
  rent_amount?: number | string
  start_date?: string
  end_date?: string
  status?: string
  created_at?: string
  unit?: {
    id: number
    number: string
    property?: { id: number; name: string }
  }
  tenant?: { id: number; name: string }
}

interface UnitItem {
  id: number
  number: string
  status: string
  type?: string
  property_id?: number
  property?: { id: number; name: string; address?: string }
}

interface ComplaintItem {
  id: number
  title: string
  category?: string
  status?: string
  created_at?: string
  unit?: { number?: string; property?: { name?: string } }
}

const icons = {
  ...ICONS,
  key: 'M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9 3 14v7h7l5-5 1.5 1.5L18 15l1.5-1.5L21 15l1-1-6.5-6.5',
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  cash: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z',
  chevronDown: 'M6 9l6 6 6-6',
}

const AVATAR_COLORS = ['#10B981', '#0284C7', '#D97706', '#7C3AED', '#DC2626', '#0891B2']

function aed(value: number) {
  return `AED ${value.toLocaleString(undefined, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

function initials(name?: string) {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
}

function TrendPill({
  text,
  tone = 'green',
}: {
  text: string
  tone?: 'green' | 'red' | 'slate'
}) {
  const styles = {
    green: { bg: '#DCFCE7', color: '#15803D' },
    red: { bg: '#FEE2E2', color: '#B91C1C' },
    slate: { bg: '#F1F5F9', color: '#64748B' },
  }[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 999,
        background: styles.bg,
        color: styles.color,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  )
}

function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: 'green' | 'amber' | 'red' | 'blue' | 'slate'
}) {
  const map = {
    green: { bg: '#DCFCE7', color: '#15803D' },
    amber: { bg: '#FEF3C7', color: '#B45309' },
    red: { bg: '#FEE2E2', color: '#B91C1C' },
    blue: { bg: '#DBEAFE', color: '#1D4ED8' },
    slate: { bg: '#F1F5F9', color: '#475569' },
  }[tone]
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 9px',
        borderRadius: 999,
        background: map.bg,
        color: map.color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function Panel({
  title,
  subtitle,
  action,
  children,
  style,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <div className="gfh-dash-card" style={style}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: THEME.ink }}>{title}</h2>
          {subtitle && (
            <div style={{ marginTop: 3, fontSize: 12.5, color: THEME.textMuted }}>{subtitle}</div>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function complaintVisual(status?: string, category?: string) {
  const s = (status || '').toLowerCase()
  const cat = (category || '').toLowerCase()
  const icon = cat.includes('electric') || cat.includes('light') ? icons.bulb : icons.wrench
  if (s === 'resolved' || s === 'closed') {
    return { icon, tone: 'green' as const, label: 'Completed', iconBg: '#DCFCE7', iconColor: '#15803D' }
  }
  if (s === 'in_progress' || s === 'assigned') {
    return { icon, tone: 'amber' as const, label: 'In Progress', iconBg: '#FEF3C7', iconColor: '#B45309' }
  }
  return { icon, tone: 'red' as const, label: 'Open', iconBg: '#FEE2E2', iconColor: '#B91C1C' }
}

function paymentTone(status?: string, type?: string) {
  const s = `${status || ''} ${type || ''}`.toLowerCase()
  if (s.includes('pending') || s.includes('due') || s.includes('unpaid')) {
    return { tone: 'amber' as const, label: 'Pending' }
  }
  return { tone: 'green' as const, label: 'Paid' }
}

export default function OwnerDashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [properties, setProperties] = useState<PropertyItem[]>([])
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [contracts, setContracts] = useState<ContractItem[]>([])
  const [units, setUnits] = useState<UnitItem[]>([])
  const [complaints, setComplaints] = useState<ComplaintItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [revenueRange, setRevenueRange] = useState<'ytd' | '12m'>('12m')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [sumRes, propRes, payRes, conRes, unitRes, compRes] = await Promise.all([
          api.get('/owner/dashboard/summary').catch(() => ({ data: { data: { portfolio: null } } })),
          api.get('/owner/dashboard/properties').catch(() =>
            api.get('/owner/properties').catch(() => ({ data: { data: { properties: [] } } })),
          ),
          api.get('/owner/payments').catch(() => ({ data: { data: { payments: [] } } })),
          api.get('/owner/contracts').catch(() => ({ data: { data: { contracts: [] } } })),
          api.get('/owner/units').catch(() => ({ data: { data: { units: [] } } })),
          api.get('/owner/complaints').catch(() => ({ data: { data: { complaints: [] } } })),
        ])

        if (cancelled) return

        if (sumRes.data?.data?.portfolio) setSummary(sumRes.data.data.portfolio)

        const props = propRes.data?.data?.properties || propRes.data?.data || []
        const pays = payRes.data?.data?.payments || payRes.data?.data || []
        const cons = conRes.data?.data?.contracts || conRes.data?.data || []
        const uns = unitRes.data?.data?.units || unitRes.data?.data || []
        const comps = compRes.data?.data?.complaints || compRes.data?.data || []

        setProperties(Array.isArray(props) ? props : [])
        setPayments(Array.isArray(pays) ? pays : [])
        setContracts(Array.isArray(cons) ? cons : [])
        setUnits(Array.isArray(uns) ? uns : [])
        setComplaints(Array.isArray(comps) ? comps : [])
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  const totalProperties = summary?.total_properties ?? properties.length
  const totalRented = summary?.occupied_units
    ?? units.filter(u => (u.status || '').toUpperCase() === 'OCCUPIED').length
  const vacantUnits = summary?.vacant_units
    ?? units.filter(u => {
      const s = (u.status || '').toUpperCase()
      return s === 'AVAILABLE' || s === 'VACANT'
    }).length
  const bookedUnits = summary?.booked_units
    ?? units.filter(u => (u.status || '').toUpperCase() === 'BOOKED').length
  const totalUnits = summary?.total_units ?? ((totalRented + vacantUnits + bookedUnits) || units.length)

  const occupancyPercent = totalUnits > 0
    ? Math.round((totalRented / totalUnits) * 100)
    : (totalRented > 0 ? 100 : 0)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const monthlyRevenue = useMemo(() => {
    return payments
      .filter(p => {
        const d = new Date(p.payment_date || p.date || p.created_at || '')
        return !Number.isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth
      })
      .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0)
  }, [payments, currentYear, currentMonth])

  const lastMonthRevenue = useMemo(() => {
    const d = new Date(currentYear, currentMonth - 1, 1)
    return payments
      .filter(p => {
        const pd = new Date(p.payment_date || p.date || p.created_at || '')
        return !Number.isNaN(pd.getTime()) && pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth()
      })
      .reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0)
  }, [payments, currentYear, currentMonth])

  const revenueTrendPct = lastMonthRevenue > 0
    ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : null

  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const revenueChartData = useMemo(() => {
    const points: { month: string; revenue: number }[] = []

    if (revenueRange === 'ytd') {
      for (let i = 0; i <= currentMonth; i++) {
        points.push({ month: monthsShort[i], revenue: 0 })
      }
      payments.forEach(p => {
        const d = new Date(p.payment_date || p.date || p.created_at || '')
        if (Number.isNaN(d.getTime()) || d.getFullYear() !== currentYear) return
        const m = d.getMonth()
        if (m <= currentMonth) points[m].revenue += parseFloat(String(p.amount)) || 0
      })
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1)
        points.push({ month: monthsShort[d.getMonth()], revenue: 0 })
      }
      payments.forEach(p => {
        const d = new Date(p.payment_date || p.date || p.created_at || '')
        if (Number.isNaN(d.getTime())) return
        const idx = points.findIndex((_, i) => {
          const pd = new Date(currentYear, currentMonth - (11 - i), 1)
          return d.getFullYear() === pd.getFullYear() && d.getMonth() === pd.getMonth()
        })
        if (idx >= 0) points[idx].revenue += parseFloat(String(p.amount)) || 0
      })
    }

    // Fallback: show scheduled rent from active contracts when no payments yet
    if (!points.some(p => p.revenue > 0) && contracts.length > 0) {
      const activeRent = contracts
        .filter(c => (c.status || '').toLowerCase() === 'active')
        .reduce((sum, c) => sum + (parseFloat(String(c.rent_amount)) || 0), 0)
      if (points.length) points[points.length - 1].revenue = activeRent
    }

    return points
  }, [payments, contracts, revenueRange, currentYear, currentMonth])

  const propertyRows = useMemo(() => {
    const byId = new Map<number, {
      id: number
      name: string
      address: string
      total: number
      occupied: number
      imageType?: string
    }>()

    properties.forEach(p => {
      byId.set(p.id, {
        id: p.id,
        name: p.name,
        address: p.address || 'Dubai, UAE',
        total: 0,
        occupied: 0,
      })
    })

    units.forEach(u => {
      const propId = u.property_id || u.property?.id
      if (!propId) return
      if (!byId.has(propId)) {
        byId.set(propId, {
          id: propId,
          name: u.property?.name || `Property #${propId}`,
          address: u.property?.address || 'Dubai, UAE',
          total: 0,
          occupied: 0,
          imageType: u.type,
        })
      }
      const row = byId.get(propId)!
      row.total += 1
      if ((u.status || '').toUpperCase() === 'OCCUPIED') row.occupied += 1
      if (!row.imageType && u.type) row.imageType = u.type
    })

    return Array.from(byId.values())
      .map(r => ({
        ...r,
        occupancy: r.total > 0 ? Math.round((r.occupied / r.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
      .slice(0, 4)
  }, [properties, units])

  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => {
        const da = new Date(a.payment_date || a.date || a.created_at || 0).getTime()
        const db = new Date(b.payment_date || b.date || b.created_at || 0).getTime()
        return db - da
      })
      .slice(0, 4)
  }, [payments])

  const recentComplaints = useMemo(() => {
    return [...complaints]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 4)
  }, [complaints])

  const formatAxisAmount = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${Math.round(value / 1_000)}k`
    return String(value)
  }

  const revenueAmount = monthlyRevenue || contracts
    .filter(c => (c.status || '').toLowerCase() === 'active')
    .reduce((s, c) => s + (parseFloat(String(c.rent_amount)) || 0), 0)
  const revenueIsEstimated = monthlyRevenue <= 0 && revenueAmount > 0

  if (isLoading) {
    return (
      <div className="gfh-portal-page" style={{ padding: '60px 20px', textAlign: 'center', color: THEME.textMuted }}>
        <style>{portalPageCss}</style>
        <div
          style={{
            width: 36,
            height: 36,
            border: `3px solid ${THEME.border}`,
            borderTopColor: THEME.navy,
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
            margin: '0 auto 14px',
          }}
        />
        <span style={{ fontSize: 14, fontWeight: 600 }}>Loading dashboard…</span>
      </div>
    )
  }

  const kpiCards = [
    {
      to: '/owner/portfolio',
      label: 'Total Properties',
      value: String(totalProperties),
      prefix: undefined as string | undefined,
      hint: totalUnits > 0
        ? `${totalUnits} unit${totalUnits === 1 ? '' : 's'} across your portfolio`
        : 'No units added yet',
      badge: null as { text: string; tone: 'green' | 'red' | 'slate' } | null,
      icon: icons.building,
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
    },
    {
      to: '/owner/portfolio?status=occupied',
      label: 'Occupied Units',
      value: String(totalRented),
      prefix: undefined as string | undefined,
      hint: totalUnits > 0
        ? `${occupancyPercent}% occupancy · ${totalUnits} total units`
        : 'No units to measure yet',
      badge: { text: `${occupancyPercent}% filled`, tone: 'green' as const },
      icon: icons.key,
      iconBg: '#DCFCE7',
      iconColor: '#059669',
    },
    {
      to: '/owner/portfolio?status=vacant',
      label: 'Vacant Units',
      value: String(vacantUnits),
      prefix: undefined as string | undefined,
      hint: vacantUnits === 0
        ? 'All units currently rented or booked'
        : `${vacantUnits} available to rent · ${bookedUnits} booked`,
      badge: vacantUnits === 0
        ? { text: 'Fully leased', tone: 'green' as const }
        : { text: 'Needs attention', tone: 'red' as const },
      icon: icons.home,
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
    },
    {
      to: '/owner/payments',
      label: 'Monthly Revenue',
      value: revenueAmount.toLocaleString(undefined, {
        minimumFractionDigits: revenueAmount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }),
      prefix: 'AED',
      hint: revenueIsEstimated
        ? 'Based on active contract rent this month'
        : revenueTrendPct === null
          ? 'Collected from payments this month'
          : `${revenueTrendPct >= 0 ? 'Up' : 'Down'} ${Math.abs(revenueTrendPct)}% vs last month`,
      badge: revenueTrendPct === null
        ? { text: 'This month', tone: 'slate' as const }
        : {
            text: `${revenueTrendPct >= 0 ? '+' : ''}${revenueTrendPct}%`,
            tone: revenueTrendPct >= 0 ? 'green' as const : 'red' as const,
          },
      icon: icons.cash,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
    },
  ]

  const vacantPct = totalUnits > 0 ? Math.round((vacantUnits / totalUnits) * 100) : 0
  const circleR = 54
  const circleC = 2 * Math.PI * circleR
  const occOffset = circleC - (circleC * occupancyPercent) / 100

  return (
    <div className="gfh-portal-page" style={{ fontFamily: 'var(--font-sans)', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        ${portalPageCss}
        .gfh-dash-card {
          background: #ffffff;
          border: 1px solid ${THEME.border};
          border-radius: 16px;
          padding: 20px 22px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          box-sizing: border-box;
        }
        .gfh-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 16px;
        }
        .gfh-kpi-link {
          text-decoration: none;
          color: inherit;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .gfh-kpi-link:hover {
          border-color: #CBD5E1 !important;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.07) !important;
          transform: translateY(-1px);
        }
        .gfh-kpi-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748B;
          line-height: 1.3;
        }
        .gfh-kpi-value-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-top: 8px;
          min-width: 0;
        }
        .gfh-kpi-prefix {
          font-size: 14px;
          font-weight: 700;
          color: #94A3B8;
          letter-spacing: 0.02em;
        }
        .gfh-kpi-value {
          font-size: 28px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.03em;
          line-height: 1.1;
          font-variant-numeric: tabular-nums;
          word-break: break-word;
        }
        .gfh-kpi-hint {
          margin-top: 8px;
          font-size: 12.5px;
          font-weight: 500;
          color: #94A3B8;
          line-height: 1.35;
        }
        .gfh-mid-row {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
          gap: 14px;
          margin-bottom: 16px;
        }
        .gfh-lists-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .gfh-list-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #F1F5F9;
        }
        .gfh-list-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .gfh-view-all {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12.5;
          font-weight: 600;
          color: #0284C7;
          text-decoration: none;
          white-space: nowrap;
        }
        .gfh-view-all:hover { color: #0369A1; }
        .gfh-empty {
          padding: 28px 8px;
          text-align: center;
          font-size: 13;
          color: ${THEME.textMuted};
        }
        @media (max-width: 1200px) {
          .gfh-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gfh-lists-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 960px) {
          .gfh-mid-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .gfh-kpi-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* KPI row */}
      <div className="gfh-kpi-grid">
        {kpiCards.map(card => (
          <Link
            key={card.label}
            to={card.to}
            className="gfh-dash-card gfh-kpi-link"
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 148,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: card.iconBg,
                  color: card.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon path={card.icon} size={19} />
              </div>
              {card.badge ? <TrendPill text={card.badge.text} tone={card.badge.tone} /> : null}
            </div>

            <div style={{ marginTop: 14 }}>
              <div className="gfh-kpi-label">{card.label}</div>
              <div className="gfh-kpi-value-row">
                {card.prefix ? <span className="gfh-kpi-prefix">{card.prefix}</span> : null}
                <span
                  className="gfh-kpi-value"
                  style={{ fontSize: String(card.value).length > 9 ? 22 : 28 }}
                >
                  {card.value}
                </span>
              </div>
              <div className="gfh-kpi-hint">{card.hint}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="gfh-mid-row">
        <Panel
          title="Revenue Overview"
          subtitle="Rental income collected"
          action={(
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                border: `1px solid ${THEME.border}`,
                borderRadius: 999,
                padding: '6px 12px',
                background: '#F8FAFC',
                position: 'relative',
              }}
            >
              <select
                value={revenueRange}
                onChange={e => setRevenueRange(e.target.value as 'ytd' | '12m')}
                style={{
                  appearance: 'none',
                  border: 'none',
                  background: 'transparent',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: THEME.ink,
                  paddingRight: 14,
                  outline: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <option value="12m">Last 12 Months</option>
                <option value="ytd">Year to Date</option>
              </select>
              <span style={{ position: 'absolute', right: 10, pointerEvents: 'none', color: THEME.textMuted }}>
                <Icon path={icons.chevronDown} size={12} />
              </span>
            </div>
          )}
        >
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: THEME.textMuted, fontSize: 12, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: THEME.textMuted, fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatAxisAmount}
                  width={42}
                />
                <Tooltip
                  formatter={(value) => [aed(Number(value ?? 0)), 'Revenue']}
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${THEME.border}`,
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                    fontSize: 12,
                  }}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={36}>
                  {revenueChartData.map((_, i) => (
                    <Cell key={i} fill="#10B981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Occupancy Overview" subtitle="Current portfolio utilization">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 28,
              flexWrap: 'wrap',
              minHeight: 240,
            }}
          >
            <div style={{ position: 'relative', width: 150, height: 150 }}>
              <svg width="150" height="150" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={circleR} fill="none" stroke="#E2E8F0" strokeWidth="14" />
                <circle
                  cx="70"
                  cy="70"
                  r={circleR}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="14"
                  strokeDasharray={circleC}
                  strokeDashoffset={occOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 28, fontWeight: 700, color: THEME.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {occupancyPercent}%
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: THEME.textMuted, marginTop: 4 }}>
                  Occupied
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 150 }}>
              {[
                { label: 'Occupied Units', value: totalRented, pct: occupancyPercent, color: '#10B981' },
                { label: 'Vacant Units', value: vacantUnits, pct: vacantPct, color: '#CBD5E1' },
                { label: 'Total Units', value: totalUnits, pct: null, color: '#94A3B8' },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: row.color }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: THEME.ink, fontVariantNumeric: 'tabular-nums' }}>
                      {row.value}
                      {row.pct !== null ? (
                        <span style={{ fontWeight: 600, color: THEME.textMuted, fontSize: 12, marginLeft: 6 }}>
                          ({row.pct}%)
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Bottom lists */}
      <div className="gfh-lists-row">
        <Panel
          title="My Properties"
          subtitle="Portfolio snapshot"
          action={<Link to="/owner/portfolio" className="gfh-view-all">View All <Icon path={icons.arrowRight} size={12} /></Link>}
        >
          {propertyRows.length === 0 ? (
            <div className="gfh-empty">No properties yet</div>
          ) : (
            propertyRows.map(prop => (
              <Link
                key={prop.id}
                to={`/owner/properties/${prop.id}`}
                className="gfh-list-row"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img
                  src={getDefaultUnitImageUrl(prop.imageType)}
                  alt={prop.name}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    objectFit: 'cover',
                    background: '#F1F5F9',
                    border: `1px solid ${THEME.border}`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prop.name}
                  </div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {prop.address}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    {prop.total} units
                  </div>
                  <StatusPill
                    label={`${prop.occupancy}%`}
                    tone={prop.occupancy >= 90 ? 'green' : prop.occupancy >= 50 ? 'amber' : 'red'}
                  />
                </div>
              </Link>
            ))
          )}
        </Panel>

        <Panel
          title="Recent Payments"
          subtitle="Latest collections"
          action={<Link to="/owner/payments" className="gfh-view-all">View All <Icon path={icons.arrowRight} size={12} /></Link>}
        >
          {recentPayments.length === 0 ? (
            <div className="gfh-empty">No payments recorded</div>
          ) : (
            recentPayments.map((p, i) => {
              const name = p.tenant?.name || p.contract?.tenant?.name || 'Tenant'
              const unitLabel = [
                p.contract?.unit?.property?.name,
                p.contract?.unit?.number ? `Unit ${p.contract.unit.number}` : null,
              ].filter(Boolean).join(' · ') || '—'
              const status = paymentTone(p.status, p.type)
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
              return (
                <div key={p.id} className="gfh-list-row">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: `${color}18`,
                      color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {initials(name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.ink }}>{name}</div>
                    <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {unitLabel}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: THEME.ink, fontVariantNumeric: 'tabular-nums' }}>
                      {aed(parseFloat(String(p.amount)) || 0)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: THEME.textMuted }}>
                        {formatDate(p.payment_date || p.date || p.created_at)}
                      </span>
                      <StatusPill label={status.label} tone={status.tone} />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </Panel>

        <Panel
          title="Maintenance Requests"
          subtitle="Open tickets & updates"
          action={<Link to="/owner/complaints" className="gfh-view-all">View All <Icon path={icons.arrowRight} size={12} /></Link>}
        >
          {recentComplaints.length === 0 ? (
            <div className="gfh-empty">No maintenance requests</div>
          ) : (
            recentComplaints.map(c => {
              const visual = complaintVisual(c.status, c.category)
              const place = [
                c.unit?.property?.name,
                c.unit?.number ? `Unit ${c.unit.number}` : null,
              ].filter(Boolean).join(' · ') || '—'
              return (
                <div key={c.id} className="gfh-list-row">
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: visual.iconBg,
                      color: visual.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon path={visual.icon} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.title || 'Maintenance request'}
                    </div>
                    <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2 }}>
                      {place}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: THEME.textMuted, marginBottom: 4 }}>
                      {formatDate(c.created_at)}
                    </div>
                    <StatusPill label={visual.label} tone={visual.tone} />
                  </div>
                </div>
              )
            })
          )}
        </Panel>
      </div>
    </div>
  )
}
