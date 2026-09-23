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
  created_at?: string
  contract?: {
    unit?: {
      number?: string
    }
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

export default function OwnerDashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [rentCollectionTotal, setRentCollectionTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false

    const fetchDashboardData = async () => {
      try {
        const [sumRes, payRes] = await Promise.all([
          api.get('/owner/dashboard/summary').catch(() => ({ data: { data: { portfolio: null } } })),
          api.get('/owner/payments').catch(() => ({ data: { data: { payments: [] } } })),
        ])

        if (!isCancelled) {
          if (sumRes.data?.data?.portfolio) {
            setSummary(sumRes.data.data.portfolio)
          }

          const payments: PaymentItem[] = payRes.data?.data?.payments || []
          if (payments.length > 0) {
            const currentMonth = new Date().getMonth()
            const currentYear = new Date().getFullYear()

            // Sum payments for current month
            const thisMonthTotal = payments
              .filter(p => {
                const dateStr = p.payment_date || p.created_at
                if (!dateStr) return false
                const d = new Date(dateStr)
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear
              })
              .reduce((acc, curr) => acc + (parseFloat(String(curr.amount)) || 0), 0)

            setRentCollectionTotal(thisMonthTotal)
          }
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

  // 12 Months Portfolio Trends Data
  const monthlyTrends = [
    { month: 'Jan', value: 12000, height: 26 },
    { month: 'Feb', value: 18000, height: 35 },
    { month: 'Mar', value: 24000, height: 44 },
    { month: 'Apr', value: 31000, height: 55 },
    { month: 'May', value: 38000, height: 64 },
    { month: 'Jun', value: 46000, height: 72 },
    { month: 'Jul', value: 52000, height: 79 },
    { month: 'Aug', value: 58000, height: 86 },
    { month: 'Sep', value: 65000, height: 95 },
    { month: 'Oct', value: 72000, height: 104 },
    { month: 'Nov', value: 79000, height: 112 },
    { month: 'Dec', value: 88000, height: 122 },
  ]

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
    <div style={{ fontFamily: "'Poppins', system-ui, sans-serif", width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .gfh-dash-card {
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .gfh-dash-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }
        .gfh-dash-panel {
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(16, 24, 40, 0.03);
          box-sizing: border-box;
        }
        .gfh-action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: #F8FAFC;
          border: 1px solid #F1F5F9;
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.18s ease;
        }
        .gfh-action-row:hover {
          background: #F1F5F9;
          border-color: #E2E8F0;
          transform: translateX(2px);
        }
        .gfh-activity-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #F1F5F9;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s ease;
        }
        .gfh-activity-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .gfh-activity-row:hover .gfh-act-title {
          color: #0F8A67;
        }
        .gfh-bar-col:hover .gfh-bar-rect {
          fill: #0F8A67 !important;
        }
      `}</style>

      {/* ── TOP 4 METRIC CARDS ──────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 20,
      }}>
        {/* CARD 1: Total Properties (Cyan / Ocean Blue) */}
        <div className="gfh-dash-card" style={{ background: '#0284C7', minHeight: 128 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.building} size={18} color="#FFFFFF" />
            </div>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.pencil} size={13} color="#FFFFFF" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {totalProperties}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>
              Total Properties
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
              Total properties in your portfolio.
            </div>
          </div>
        </div>

        {/* CARD 2: Total Rented (Vibrant Green) */}
        <div className="gfh-dash-card" style={{ background: '#10B981', minHeight: 128 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.home} size={18} color="#FFFFFF" />
            </div>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.pencil} size={13} color="#FFFFFF" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {totalRented}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>
              Total Rented
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
              Properties currently rented
            </div>
          </div>
        </div>

        {/* CARD 3: Vacant Properties (Slate Charcoal Blue) */}
        <div className="gfh-dash-card" style={{ background: '#475569', minHeight: 128 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.door} size={18} color="#FFFFFF" />
            </div>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.pencil} size={13} color="#FFFFFF" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {vacantUnits}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>
              Vacant Properties
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
              Properties currently vacant
            </div>
          </div>
        </div>

        {/* CARD 4: Rent Collection (Golden Amber) */}
        <div className="gfh-dash-card" style={{ background: '#F59E0B', minHeight: 128 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.cash} size={18} color="#FFFFFF" />
            </div>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon path={icons.pencil} size={13} color="#FFFFFF" />
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {rentCollectionTotal > 0
                ? rentCollectionTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '0.00'}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>
              Rent Collection
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
              Total rent collection (this month)
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE ROW: Occupancy Overview & Quick Actions ──────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20,
        marginBottom: 20,
      }}>
        {/* OCCUPANCY OVERVIEW CARD */}
        <div className="gfh-dash-panel">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <div style={{ color: '#475569', marginTop: 2 }}>
              <Icon path={icons.pie} size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Occupancy Overview
              </h2>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                Rented vs Vacant units
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            gap: 24,
            padding: '12px 10px',
            flexWrap: 'wrap',
          }}>
            {/* Donut Gauge */}
            <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="140" height="140" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background track circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  stroke="#E2E8F0"
                  strokeWidth="11"
                  fill="transparent"
                />
                {/* Green progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={circleRadius}
                  stroke="#10B981"
                  strokeWidth="11"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={circleOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              {/* Inner Center Text */}
              <div style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                  {occupancyPercent}%
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 3 }}>
                  Occupied
                </div>
              </div>
            </div>

            {/* Legend Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 170 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Rented Units</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{totalRented}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#94A3B8', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Vacant Units</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{vacantUnits}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS CARD */}
        <div className="gfh-dash-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
            <div style={{ color: '#475569' }}>
              <Icon path={icons.sparkle} size={16} />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Quick Actions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {/* Action 1 */}
            <Link to="/owner/properties" className="gfh-action-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#EFF6FF',
                  border: '1px solid #DBEAFE',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={icons.document} size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                    Property Drill-down
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    View detailed stats for each property
                  </div>
                </div>
              </div>
              <div style={{ color: '#2563EB', display: 'flex', alignItems: 'center' }}>
                <Icon path={icons.chevron} size={16} />
              </div>
            </Link>

            {/* Action 2 */}
            <Link to="/owner/vacant-units" className="gfh-action-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#F0FDF4',
                  border: '1px solid #DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={icons.home} size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                    Vacant Units Report
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    Filter and list all currently available units
                  </div>
                </div>
              </div>
              <div style={{ color: '#16A34A', display: 'flex', alignItems: 'center' }}>
                <Icon path={icons.chevron} size={16} />
              </div>
            </Link>

            {/* Action 3 */}
            <Link to="/owner/ledger" className="gfh-action-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#FAF5FF',
                  border: '1px solid #F3E8FF',
                  color: '#9333EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={icons.user} size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                    Rent Ledger
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    Debit / credit history across your contracts
                  </div>
                </div>
              </div>
              <div style={{ color: '#9333EA', display: 'flex', alignItems: 'center' }}>
                <Icon path={icons.chevron} size={16} />
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
        {/* PORTFOLIO TRENDS CARD */}
        <div className="gfh-dash-panel">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <div style={{ color: '#475569', marginTop: 2 }}>
              <Icon path={icons.trending} size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Portfolio Trends
              </h2>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                Monthly rent collection
              </div>
            </div>
          </div>

          {/* Monthly Bar Chart */}
          <div style={{ width: '100%', height: 180, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: 10 }}>
            {/* Bars container */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: 140,
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: 6,
            }}>
              {monthlyTrends.map((item) => (
                <div
                  key={item.month}
                  className="gfh-bar-col"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: 'pointer',
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
                      background: '#0D9488',
                      borderRadius: '3px 3px 0 0',
                      transition: 'background 0.2s ease, height 0.3s ease',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* X-Axis Month Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              {monthlyTrends.map(item => (
                <span
                  key={item.month}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#94A3B8',
                  }}
                >
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY CARD */}
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
              to="/owner/payments"
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
            {/* Activity 1 */}
            <Link to="/owner/payments" className="gfh-activity-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={icons.cash} size={15} />
                </div>
                <div>
                  <div className="gfh-act-title" style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', transition: 'color 0.15s ease' }}>
                    Rent received — Unit 101
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    AED 3,500 • 2 days ago
                  </div>
                </div>
              </div>
              <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                <Icon path={icons.chevron} size={15} />
              </div>
            </Link>

            {/* Activity 2 */}
            <Link to="/owner/contracts" className="gfh-activity-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#DBEAFE',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={icons.document} size={15} />
                </div>
                <div>
                  <div className="gfh-act-title" style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', transition: 'color 0.15s ease' }}>
                    New contract signed — Unit 204
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    Drafted • 4 days ago
                  </div>
                </div>
              </div>
              <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                <Icon path={icons.chevron} size={15} />
              </div>
            </Link>

            {/* Activity 3 */}
            <Link to="/owner/vacant-units" className="gfh-activity-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={icons.home} size={15} />
                </div>
                <div>
                  <div className="gfh-act-title" style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', transition: 'color 0.15s ease' }}>
                    Tenancy updated — Unit 305
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    Status changed to Vacant • 6 days ago
                  </div>
                </div>
              </div>
              <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                <Icon path={icons.chevron} size={15} />
              </div>
            </Link>

            {/* Activity 4 */}
            <Link to="/owner/service-charges" className="gfh-activity-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#F3E8FF',
                  color: '#9333EA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon path={icons.bolt} size={15} />
                </div>
                <div>
                  <div className="gfh-act-title" style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', transition: 'color 0.15s ease' }}>
                    Service charge posted — Unit 112
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                    AED 150 • 7 days ago
                  </div>
                </div>
              </div>
              <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                <Icon path={icons.chevron} size={15} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
