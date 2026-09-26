import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

interface PortfolioSummary {
  total_properties: number
  total_units: number
  occupied_units: number
  vacant_units: number
  booked_units: number
}

interface PaymentItem {
  id: number
  amount: number | string
  payment_date?: string
  date?: string
  created_at?: string
  type?: string
  contract?: {
    unit?: {
      number?: string
    }
  }
}

interface ContractItem {
  id: number
  unit_id: number
  tenant_id?: number
  rent_amount?: number | string
  start_date?: string
  end_date?: string
  status?: string
  created_at?: string
  unit?: {
    id: number
    number: string
    property?: {
      id: number
      name: string
    }
  }
  tenant?: {
    id: number
    name: string
  }
}

interface UnitItem {
  id: number
  number: string
  status: string
  price?: number | string
  updated_at?: string
  created_at?: string
  property?: {
    id: number
    name: string
  }
}

interface ComplaintItem {
  id: number
  title?: string
  status?: string
  created_at?: string
  unit?: {
    number?: string
  }
}

// ── SVG Icon Helper ────────────────────────────────────────────────────────
const Icon = ({ path, size = 18, color = 'currentColor' }: { path: string; size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
)

const icons = {
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12',
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  key: 'M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9 3 14v7h7l5-5 1.5 1.5L18 15l1.5-1.5L21 15l1-1-6.5-6.5',
  cash: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  coins: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  pencil: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
  sparkle: 'M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z',
  chart: 'M18 20V10M12 20V4M6 20v-6',
  trending: 'M23 6l-9.5 9.5-5-5L1 18M17 6h6v6',
  clock: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  chevron: 'M9 18l6-6-6-6',
  document: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6M16 13H8M16 17H8M10 9H8',
  pie: 'M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z',
  bolt: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
}

function formatTimeAgo(dateString?: string) {
  if (!dateString) return 'recently'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'recently'
  const now = new Date()
  const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSec < 60) return 'just now'
  const diffInMin = Math.floor(diffInSec / 60)
  if (diffInMin < 60) return `${diffInMin}m ago`
  const diffInHours = Math.floor(diffInMin / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `${diffInDays}d ago`
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) return `${diffInMonths}mo ago`
  return `${Math.floor(diffInMonths / 12)}y ago`
}

export default function OwnerDashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [contracts, setContracts] = useState<ContractItem[]>([])
  const [units, setUnits] = useState<UnitItem[]>([])
  const [complaints, setComplaints] = useState<ComplaintItem[]>([])
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    const fetchDashboardData = async () => {
      try {
        const [sumRes, payRes, conRes, unitRes, compRes] = await Promise.all([
          api.get('/owner/dashboard/summary').catch(() => ({ data: { data: { portfolio: null } } })),
          api.get('/owner/payments').catch(() => ({ data: { data: { payments: [] } } })),
          api.get('/owner/contracts').catch(() => ({ data: { data: { contracts: [] } } })),
          api.get('/owner/units').catch(() => ({ data: { data: { units: [] } } })),
          api.get('/owner/complaints').catch(() => ({ data: { data: { complaints: [] } } })),
        ])

        if (!isCancelled) {
          if (sumRes.data?.data?.portfolio) {
            setSummary(sumRes.data.data.portfolio)
          }

          setPayments(payRes.data?.data?.payments || [])
          setContracts(conRes.data?.data?.contracts || [])
          setUnits(unitRes.data?.data?.units || [])
          setComplaints(compRes.data?.data?.complaints || [])
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchDashboardData()

    return () => {
      isCancelled = true
    }
  }, [])

  // Derived values from real data
  const totalProperties = summary?.total_properties ?? 0
  const totalRented = summary?.occupied_units ?? 0
  const vacantUnits = summary?.vacant_units ?? 0
  const totalUnits = totalRented + vacantUnits

  const occupancyPercent = totalUnits > 0
    ? Math.round((totalRented / totalUnits) * 100)
    : (totalRented > 0 ? 100 : 0)

  // Circular gauge values (radius 40, circumference 2 * pi * 40 = 251.32)
  const circleRadius = 40
  const circleCircumference = 2 * Math.PI * circleRadius
  const circleOffset = circleCircumference - (circleCircumference * (occupancyPercent || 0)) / 100

  // ── 12 Months Portfolio Trends Data strictly from Database ─────────────────
  const currentYear = new Date().getFullYear()
  const currentMonthIndex = new Date().getMonth()
  const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const monthlyTotals = new Array(12).fill(0)
  const monthlyCounts = new Array(12).fill(0)

  // 1. Calculate from real payments in database
  payments.forEach(p => {
    const dateStr = p.payment_date || p.date || p.created_at
    if (!dateStr) return
    const d = new Date(dateStr)
    if (d.getFullYear() === currentYear) {
      const m = d.getMonth()
      if (m >= 0 && m < 12) {
        monthlyTotals[m] += parseFloat(String(p.amount)) || 0
        monthlyCounts[m] += 1
      }
    }
  })

  // 2. If payments table has no records yet for this owner, reflect scheduled rent from active contracts
  const hasPayments = monthlyTotals.some(v => v > 0)
  if (!hasPayments && contracts.length > 0) {
    contracts.forEach(c => {
      const dateStr = c.start_date || c.created_at
      if (!dateStr) return
      const d = new Date(dateStr)
      const m = d.getMonth()
      const rent = parseFloat(String(c.rent_amount)) || 0
      if (d.getFullYear() === currentYear && m >= 0 && m < 12) {
        monthlyTotals[m] += rent
        monthlyCounts[m] += 1
      }
    })
  }

  const maxTrendValue = Math.max(...monthlyTotals, 0)
  const monthlyTrends = monthsNames.map((name, i) => {
    const val = monthlyTotals[i]
    const height = maxTrendValue > 0 ? Math.max(Math.round((val / maxTrendValue) * 125), val > 0 ? 12 : 4) : 4
    return {
      month: name,
      fullName: `${monthsFull[i]} ${currentYear}`,
      value: val,
      height,
      count: monthlyCounts[i],
    }
  })

  // Current month collection for card 4
  const rentCollectionTotal = monthlyTotals[currentMonthIndex] || 0

  // ── Real Recent Activities from Database ───────────────────────────────────
  const activities: Array<{
    id: string
    title: string
    sub: string
    date: string
    timeAgo: string
    link: string
    icon: string
    iconBg: string
    iconColor: string
  }> = []

  // Contract events
  contracts.forEach(c => {
    const unitNum = c.unit?.number ? `Unit ${c.unit.number}` : 'Unit'
    const tenantText = c.tenant?.name ? `Tenant: ${c.tenant.name}` : 'Contract Active'
    const rentText = c.rent_amount ? `AED ${Number(c.rent_amount).toLocaleString()}` : ''
    const dt = c.created_at || c.start_date || ''
    activities.push({
      id: `contract-${c.id}`,
      title: `Contract active — ${unitNum}`,
      sub: [tenantText, rentText].filter(Boolean).join(' • '),
      date: dt,
      timeAgo: formatTimeAgo(dt),
      link: '/owner/contracts',
      icon: icons.document,
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
    })
  })

  // Payment events
  payments.forEach(p => {
    const unitNum = p.contract?.unit?.number ? `Unit ${p.contract.unit.number}` : 'Unit'
    const amt = Number(p.amount || 0).toLocaleString()
    const dt = p.payment_date || p.date || p.created_at || ''
    activities.push({
      id: `payment-${p.id}`,
      title: `Rent payment received — ${unitNum}`,
      sub: `AED ${amt}`,
      date: dt,
      timeAgo: formatTimeAgo(dt),
      link: '/owner/payments',
      icon: icons.cash,
      iconBg: '#DCFCE7',
      iconColor: '#16A34A',
    })
  })

  // Unit status updates
  units.forEach(u => {
    const dt = u.updated_at || u.created_at || ''
    activities.push({
      id: `unit-${u.id}`,
      title: `Unit ${u.number} (${u.status})`,
      sub: `${u.property?.name || 'Property'}${u.price ? ` • AED ${Number(u.price).toLocaleString()}` : ''}`,
      date: dt,
      timeAgo: formatTimeAgo(dt),
      link: `/owner/units/${u.id}`,
      icon: icons.home,
      iconBg: u.status === 'AVAILABLE' ? '#ECFDF8' : '#FEF3C7',
      iconColor: u.status === 'AVAILABLE' ? '#0F8A67' : '#D97706',
    })
  })

  // Maintenance complaints
  complaints.forEach(m => {
    const dt = m.created_at || ''
    activities.push({
      id: `complaint-${m.id}`,
      title: `Maintenance: ${m.title || 'Request'}`,
      sub: `Status: ${m.status || 'Pending'}${m.unit?.number ? ` • Unit ${m.unit.number}` : ''}`,
      date: dt,
      timeAgo: formatTimeAgo(dt),
      link: '/owner/complaints',
      icon: icons.bolt,
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
    })
  })

  // Sort real activity by date descending
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const recentActivities = activities.slice(0, 5)

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
        <div style={{
          width: 38,
          height: 38,
          border: '3px solid #E2E8F0',
          borderTopColor: '#0F8A67',
          borderRadius: '50%',
          animation: 'gfhSpin 0.75s linear infinite',
          margin: '0 auto 16px',
        }} />
        <style>{`@keyframes gfhSpin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Loading owner dashboard...</span>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .gfh-dash-card {
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          text-decoration: none;
        }
        .gfh-dash-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          color: #ffffff;
        }
        .gfh-dash-panel {
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          box-sizing: border-box;
        }
        .gfh-action-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 12px 14px;
          background: #F8FAFC;
          border: 1px solid #F1F5F9;
          border-radius: 10px;
          text-decoration: none;
          color: inherit;
          transition: all 0.18s ease;
        }
        .gfh-action-row:hover {
          background: #F1F5F9;
          border-color: #E2E8F0;
          transform: translateX(3px);
        }
        .gfh-activity-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 12px 6px;
          border-bottom: 1px solid #F1F5F9;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s ease;
        }
        .gfh-activity-row:last-child {
          border-bottom: none;
        }
        .gfh-activity-row:hover .gfh-act-title {
          color: #0F8A67;
        }
        .gfh-bar-col:hover .gfh-bar-rect {
          background: #0F766E !important;
        }
      `}</style>

      {/* ── TOP ROW: 4 KPI CARDS ─────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 16,
        marginBottom: 20,
      }}>
        {/* Card 1: Total Properties */}
        <Link
          to="/owner/properties"
          className="gfh-dash-card"
          style={{ background: '#2563EB' }}
          title="View all properties"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255, 255, 255, 0.88)' }}>
              Total Properties
            </span>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.building} size={17} color="#FFFFFF" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: '#FFFFFF' }}>
              {totalProperties}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.78)', marginTop: 4 }}>
              Active in portfolio
            </div>
          </div>
        </Link>

        {/* Card 2: Total Rented */}
        <Link
          to="/owner/units?status=OCCUPIED"
          className="gfh-dash-card"
          style={{ background: '#0D9488' }}
          title="View occupied units"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255, 255, 255, 0.88)' }}>
              Total Rented
            </span>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.key} size={17} color="#FFFFFF" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: '#FFFFFF' }}>
              {totalRented}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.78)', marginTop: 4 }}>
              Occupied units
            </div>
          </div>
        </Link>

        {/* Card 3: Vacant Properties */}
        <Link
          to="/owner/vacant-units"
          className="gfh-dash-card"
          style={{ background: '#334155' }}
          title="View vacant properties"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255, 255, 255, 0.88)' }}>
              Vacant Properties
            </span>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.door} size={17} color="#FFFFFF" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: '#FFFFFF' }}>
              {vacantUnits}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.78)', marginTop: 4 }}>
              Ready for lease
            </div>
          </div>
        </Link>

        {/* Card 4: Rent Collection */}
        <Link
          to="/owner/payments"
          className="gfh-dash-card"
          style={{ background: '#D97706' }}
          title="View rent collection & payments"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255, 255, 255, 0.88)' }}>
              Rent Collection
            </span>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.cash} size={17} color="#FFFFFF" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1, color: '#FFFFFF' }}>
              AED {rentCollectionTotal.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.78)', marginTop: 4 }}>
              Current month
            </div>
          </div>
        </Link>
      </div>

      {/* ── MIDDLE ROW: Occupancy Overview & Quick Actions ───────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20,
        marginBottom: 20,
      }}>
        {/* OCCUPANCY OVERVIEW CARD */}
        <div className="gfh-dash-panel">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
            <div style={{ color: '#475569', marginTop: 2 }}>
              <Icon path={icons.pie} size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Occupancy Overview
              </h2>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                Current portfolio utilization
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 24,
            paddingTop: 6,
          }}>
            {/* Donut Gauge */}
            <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="11"
                />
                {/* Occupied Progress */}
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  fill="transparent"
                  stroke="#0D9488"
                  strokeWidth="11"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={circleOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              {/* Centered Percentage */}
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {occupancyPercent}%
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginTop: 2 }}>
                  Occupied
                </div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 150 }}>
              {/* Occupied Item */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0D9488' }} />
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Occupied</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  {totalRented} units
                </span>
              </div>

              {/* Vacant Item */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#CBD5E1' }} />
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Vacant</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  {vacantUnits} units
                </span>
              </div>

              {/* Total Units Item */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                paddingTop: 8,
                borderTop: '1px solid #F1F5F9',
              }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Total Portfolio</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                  {totalUnits} units
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS CARD */}
        <div className="gfh-dash-panel">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <div style={{ color: '#475569', marginTop: 2 }}>
              <Icon path={icons.bolt} size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Quick Actions
              </h2>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                Common portfolio tasks
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Action 1: Add New Property */}
            <Link to="/owner/properties/add" className="gfh-action-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#ECFDF8',
                  color: '#0F8A67',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon path={icons.building} size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    Add New Property
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>
                    Register a new building to portfolio
                  </div>
                </div>
              </div>
              <div style={{ color: '#94A3B8' }}>
                <Icon path={icons.chevron} size={15} />
              </div>
            </Link>

            {/* Action 2: View Vacant Units */}
            <Link to="/owner/vacant-units" className="gfh-action-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#F0F9FF',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon path={icons.door} size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    View Vacant Units
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>
                    Check availability across properties
                  </div>
                </div>
              </div>
              <div style={{ color: '#94A3B8' }}>
                <Icon path={icons.chevron} size={15} />
              </div>
            </Link>

            {/* Action 3: Review Rent Payments */}
            <Link to="/owner/payments" className="gfh-action-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#FFFBEB',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon path={icons.cash} size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
                    Review Rent Payments
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B' }}>
                    Monitor collections and pending dues
                  </div>
                </div>
              </div>
              <div style={{ color: '#94A3B8' }}>
                <Icon path={icons.chevron} size={15} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: Portfolio Trends & Recent Activity ──────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20,
      }}>
        {/* PORTFOLIO TRENDS CARD (Real Database Monthly Collection) */}
        <div className="gfh-dash-panel" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ color: '#475569', marginTop: 2 }}>
                <Icon path={icons.trending} size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Portfolio Trends
                </h2>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Monthly rent collection ({currentYear})
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F766E', background: '#F0FDFA', border: '1px solid #CCFBF1', padding: '3px 8px', borderRadius: 6 }}>
              Total: AED {monthlyTotals.reduce((a, b) => a + b, 0).toLocaleString()}
            </div>
          </div>

          {/* Monthly Bar Chart with Real Data & Tooltips */}
          <div style={{ width: '100%', height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: 10, position: 'relative' }}>
            {/* Floating Tooltip when hovering over a bar */}
            {hoveredBarIndex !== null && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {monthlyTrends[hoveredBarIndex].fullName}:{' '}
                <span style={{ color: '#2DD4BF', fontWeight: 700 }}>
                  AED {monthlyTrends[hoveredBarIndex].value.toLocaleString()}
                </span>
                {monthlyTrends[hoveredBarIndex].count > 0 && (
                  <span style={{ color: '#94A3B8', fontSize: 11, marginLeft: 6 }}>
                    ({monthlyTrends[hoveredBarIndex].count} {monthlyTrends[hoveredBarIndex].count === 1 ? 'record' : 'records'})
                  </span>
                )}
              </div>
            )}

            {/* Bars container */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: 140,
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: 6,
            }}>
              {monthlyTrends.map((item, idx) => (
                <div
                  key={item.month}
                  className="gfh-bar-col"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  title={`${item.month}: AED ${item.value.toLocaleString()}`}
                >
                  <div
                    className="gfh-bar-rect"
                    style={{
                      width: '55%',
                      maxWidth: 16,
                      minWidth: 8,
                      height: `${item.height}px`,
                      background: item.value > 0 ? (idx === currentMonthIndex ? '#0F8A67' : '#0D9488') : '#E2E8F0',
                      borderRadius: '3px 3px 0 0',
                      transition: 'background 0.2s ease, height 0.3s ease',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* X-Axis Month Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {monthlyTrends.map((item, idx) => (
                <span
                  key={item.month}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: idx === currentMonthIndex ? 700 : 600,
                    color: idx === currentMonthIndex ? '#0F8A67' : '#94A3B8',
                  }}
                >
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY CARD (Strictly from Database) */}
        <div className="gfh-dash-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ color: '#475569' }}>
                <Icon path={icons.clock} size={16} />
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Recent Activity
              </h2>
            </div>
            <Link
              to="/owner/contracts"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#0F8A67',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              View all &gt;
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748B' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  No recent activity recorded
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>
                  Portfolio contracts, collections, and updates will appear here in real time.
                </div>
              </div>
            ) : (
              recentActivities.map(item => (
                <Link key={item.id} to={item.link} className="gfh-activity-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: item.iconBg,
                      color: item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon path={item.icon} size={15} />
                    </div>
                    <div>
                      <div className="gfh-act-title" style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', transition: 'color 0.15s ease' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                        {item.sub} {item.timeAgo ? `• ${item.timeAgo}` : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                    <Icon path={icons.chevron} size={15} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
