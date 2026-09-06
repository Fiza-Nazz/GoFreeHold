import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { Icon, CornerBrackets, heroStyle, portalPageCss } from '../../components/gfh/adminTheme'

interface Stats {
  total_properties: number
  total_units: number
  occupied_units: number
  vacant_units: number
  total_contracts: number
  open_complaints: number
  monthly_revenue: number
  pending_receivables: number
  // Optional month-over-month deltas. Populate these from the backend
  // (e.g. a future /admin/stats/trends endpoint) to power the trend chips
  // with real numbers. Until then they default to a neutral "flat" state.
  total_properties_change?: number
  occupied_units_change?: number
  total_contracts_change?: number
  vacant_units_change?: number
  monthly_revenue_change?: number
  open_complaints_change?: number
}

const icons = {
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1',
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  contracts: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  wallet: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  alert: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0z',
  refresh: 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  check: 'M20 6 9 17l-5-5',
  chevronRight: 'M9 18l6-6-6-6',
}

// ---------- shared visual helpers ----------

type TrendDirection = 'up' | 'down' | 'flat'

function getTrend(change?: number): { direction: TrendDirection; percent: number } {
  if (change === undefined || change === null || Number.isNaN(change)) {
    return { direction: 'flat', percent: 0 }
  }
  return { direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat', percent: Math.abs(Math.round(change * 10) / 10) }
}

function useCountUp(target: number, active: boolean, duration = 900) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    if (!active) { setValue(0); return }
    let start: number | null = null
    const tick = (ts: number) => {
      if (start === null) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, active, duration])
  return value
}

function TrendChip({ direction, percent }: { direction: TrendDirection; percent: number }) {
  const isFlat = direction === 'flat'
  const isUp = direction === 'up'
  const color = isFlat ? '#64748B' : isUp ? '#16A34A' : '#DC2626'
  const bg = isFlat ? '#F1F5F9' : isUp ? '#DCFCE7' : '#FEE2E2'
  const arrow = isFlat ? '—' : isUp ? '↑' : '↓'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: bg, color, fontSize: 11.5, fontWeight: 700,
      padding: '2px 8px', borderRadius: 999, lineHeight: 1.6,
    }}>
      {arrow} {percent}%
    </span>
  )
}

function StatCard({
  value, label, active, prefix = '', icon, iconBg, iconColor, trendDirection, trendPercent,
}: {
  value: number
  label: string
  active: boolean
  prefix?: string
  icon: string
  iconBg: string
  iconColor: string
  trendDirection: TrendDirection
  trendPercent: number
}) {
  const n = useCountUp(value, active)
  const formatted = `${prefix}${n.toLocaleString()}`
  const fontSize = formatted.length > 9 ? 20 : formatted.length > 7 ? 22 : 26

  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      padding: '18px 18px 16px',
      border: '1px solid #F0F1F6',
      boxShadow: '0 1px 3px rgba(16,24,40,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minHeight: 134,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon path={icon} size={20} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize, fontWeight: 800, color: '#15112B',
          letterSpacing: '-0.5px', lineHeight: 1.2,
          fontVariantNumeric: 'tabular-nums', wordBreak: 'break-word',
        }}>
          {formatted}
        </div>
        <div style={{
          fontSize: 13, color: '#8A8FA3', fontWeight: 600, marginTop: 3,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {label}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <TrendChip direction={trendDirection} percent={trendPercent} />
        <span style={{ fontSize: 11.5, color: '#A0A5B8', fontWeight: 500 }}>vs last month</span>
      </div>
    </div>
  )
}

function OccupancyBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 110 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#EEF0F5', overflow: 'hidden' }}>
        <div style={{ width: `${clamped}%`, height: '100%', borderRadius: 999, background: '#22C55E' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#4B5065', minWidth: 32, textAlign: 'right' }}>{clamped}%</span>
    </div>
  )
}

function StatusBadge({ label }: { label: string }) {
  const isActive = label.toLowerCase() === 'active'
  return (
    <span style={{
      display: 'inline-block', fontSize: 11.5, fontWeight: 700,
      padding: '3px 11px', borderRadius: 999,
      background: isActive ? '#DCFCE7' : '#FEF3C7',
      color: isActive ? '#16A34A' : '#B45309',
    }}>
      {label}
    </span>
  )
}

function getComplaintVisual(status: string) {
  const s = (status || '').toLowerCase()
  if (s === 'resolved' || s === 'closed') return { bg: '#DCFCE7', color: '#16A34A', icon: icons.check }
  if (s === 'open') return { bg: '#FFEDD5', color: '#F97316', icon: icons.alert }
  return { bg: '#DBEAFE', color: '#2563EB', icon: icons.wrench } // in_progress / default
}

function formatComplaintTime(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const startOfDay = (dt: Date) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000)
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 0) return `Today, ${time}`
  if (diffDays === 1) return `Yesterday, ${time}`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function getPropertyOccupancy(propertyId: any, allUnits: any[]) {
  const propUnits = allUnits.filter(
    (u: any) => String(u.property?.id ?? u.property_id ?? '') === String(propertyId)
  )
  const total = propUnits.length
  const occupied = propUnits.filter((u: any) => u.status === 'OCCUPIED').length
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0
  return { total, occupied, pct }
}

// ---------- donut + trend charts (plain SVG, no extra deps) ----------

function DonutChart({ collectedPct }: { collectedPct: number }) {
  const size = 132
  const stroke = 16
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, collectedPct))
  const collectedLen = (pct / 100) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      {pct > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#16A34A"
          strokeWidth={stroke}
          strokeDasharray={`${collectedLen} ${circumference - collectedLen}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  )
}

function TrendLineChart({ data }: { data: number[] }) {
  const width = 560
  const height = 150
  const safeData = data.length > 1 ? data : [0, 0]
  const max = Math.max(...safeData, 1)
  const min = Math.min(...safeData, 0)
  const range = max - min || 1
  const stepX = width / (safeData.length - 1)

  const points = safeData.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 24) - 12
    return { x, y }
  })
  const linePath = `M${points.map(p => `${p.x},${p.y}`).join(' L')}`
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="gfhTrendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#gfhTrendFill)" stroke="none" />
      <path d={linePath} fill="none" stroke="#16A34A" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#16A34A" stroke="#fff" strokeWidth={1.5} />
      ))}
    </svg>
  )
}

// ---------- unit dropdown (restyled as a rounded pill) ----------

function UnitDropdown({
  units,
  value,
  onChange,
}: {
  units: any[]
  value: string
  onChange: (val: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedUnit = units.find(u => String(u.id) === String(value))
  const selectedLabel = selectedUnit
    ? `Unit ${selectedUnit.number || selectedUnit.id}${selectedUnit.property?.name ? ` · ${selectedUnit.property.name}` : ''}`
    : `All units (${units.length})`

  const filtered = units.filter(u => {
    if (!search.trim()) return true
    const term = search.toLowerCase()
    const num = String(u.number || u.id).toLowerCase()
    const prop = String(u.property?.name || '').toLowerCase()
    return num.includes(term) || prop.includes(term)
  })

  return (
    <div ref={dropdownRef} style={{ position: 'relative', minWidth: 240 }}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          padding: '9px 16px',
          border: '1px solid #E2E8F0',
          borderRadius: 999,
          background: '#F8FAFC',
          color: '#0F172A',
          fontWeight: 600,
          fontSize: 13.5,
          fontFamily: "'Poppins', system-ui, sans-serif",
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.15s ease',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel}
        </span>
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.15s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
            color: '#64748B',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '100%',
            minWidth: 280,
            background: '#ffffff',
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 30px -6px rgba(15, 23, 42, 0.18)',
            zIndex: 999,
            borderRadius: 14,
            fontFamily: "'Poppins', system-ui, sans-serif",
            overflow: 'hidden',
          }}
        >
          {units.length > 6 && (
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search unit number or property..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: 12.5,
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            </div>
          )}

          <div style={{ maxHeight: 270, overflowY: 'auto', overflowX: 'hidden' }}>
            <div
              onClick={() => { onChange(''); setIsOpen(false); setSearch('') }}
              style={{
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: value === '' ? 700 : 500,
                color: value === '' ? '#0F8A67' : '#334155',
                background: value === '' ? '#ECFDF8' : '#ffffff',
                cursor: 'pointer',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = value === '' ? '#ECFDF8' : '#F8FAFC')}
              onMouseLeave={e => (e.currentTarget.style.background = value === '' ? '#ECFDF8' : '#ffffff')}
            >
              <span>All units</span>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, background: '#F1F5F9', padding: '2px 7px', borderRadius: 999 }}>
                {units.length}
              </span>
            </div>

            {filtered.map((u: any) => {
              const isSelected = String(u.id) === String(value)
              return (
                <div
                  key={u.id}
                  onClick={() => { onChange(String(u.id)); setIsOpen(false); setSearch('') }}
                  style={{
                    padding: '9px 14px',
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#0F8A67' : '#1E293B',
                    background: isSelected ? '#ECFDF8' : '#ffffff',
                    cursor: 'pointer',
                    borderBottom: '1px solid #F8FAFC',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = isSelected ? '#ECFDF8' : '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = isSelected ? '#ECFDF8' : '#ffffff')}
                >
                  <div>
                    <span style={{ fontWeight: 700 }}>Unit {u.number || u.id}</span>
                    {u.property?.name && (
                      <span style={{ color: '#64748B', fontSize: 12, marginLeft: 6 }}>
                        · {u.property.name}
                      </span>
                    )}
                  </div>
                  {u.status && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 999,
                      background: u.status === 'AVAILABLE' ? '#F0FDF4' : '#F1F5F9',
                      color: u.status === 'AVAILABLE' ? '#15803D' : '#64748B',
                    }}>
                      {u.status}
                    </span>
                  )}
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: 12.5, color: '#94A3B8' }}>
                No units match "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- main dashboard ----------

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total_properties: 0,
    total_units: 0,
    occupied_units: 0,
    vacant_units: 0,
    total_contracts: 0,
    open_complaints: 0,
    monthly_revenue: 0,
    pending_receivables: 0,
  })
  const [properties, setProperties] = useState<any[]>([])
  const [units, setUnits] = useState<any[]>([])
  const [recentComplaints, setRecentComplaints] = useState<any[]>([])
  const [unitFilter, setUnitFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => setReady(true), 120)
      return () => clearTimeout(t)
    }
    setReady(false)
  }, [isLoading])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [bRes, uRes, cRes, compRes, recRes] = await Promise.all([
        api.get('/admin/properties'),
        api.get('/admin/units'),
        api.get('/admin/contracts'),
        api.get('/admin/complaints'),
        api.get('/admin/payables/summary'),
      ])

      const props = bRes.data.data.properties || []
      const unitList = uRes.data.data.units || []
      const contracts = cRes.data.data.contracts || []
      const complaints = compRes.data.data.complaints || []
      const payables = recRes.data.data.payables || []

      const occupied = unitList.filter((u: any) => u.status === 'OCCUPIED').length
      const vacant = unitList.filter((u: any) => u.status === 'AVAILABLE').length

      const totalRevenue = contracts
        .filter((c: any) => c.status === 'active' || c.status === 'renewed')
        .reduce((sum: number, c: any) => sum + Number(c.rent_amount || 0), 0)

      const totalReceivables = payables.reduce((sum: number, p: any) => sum + Number(p.total_payable || 0), 0)

      setProperties(props)
      setUnits(unitList)
      setStats(prev => ({
        ...prev,
        total_properties: props.length,
        total_units: unitList.length,
        occupied_units: occupied,
        vacant_units: vacant,
        total_contracts: contracts.length,
        open_complaints: complaints.filter((c: any) => c.status === 'open' || c.status === 'in_progress').length,
        monthly_revenue: totalRevenue,
        pending_receivables: totalReceivables,
      }))
      setRecentComplaints(complaints.slice(0, 4))
    } catch (err) {
      console.error('Error loading dashboard data', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredComplaints = useMemo(() => {
    if (!unitFilter) return recentComplaints
    return recentComplaints.filter(c => String(c.unit_id) === String(unitFilter) || String(c.unit?.id) === String(unitFilter))
  }, [recentComplaints, unitFilter])

  const cards = [
    {
      value: stats.total_properties, label: 'Total Properties', icon: icons.building,
      iconBg: '#DCFCE7', iconColor: '#16A34A', ...getTrend(stats.total_properties_change),
    },
    {
      value: stats.occupied_units, label: 'Rented / Occupied', icon: icons.door,
      iconBg: '#DBEAFE', iconColor: '#2563EB', ...getTrend(stats.occupied_units_change),
    },
    {
      value: stats.total_contracts, label: 'Active Bookings', icon: icons.contracts,
      iconBg: '#EDE9FE', iconColor: '#7C3AED', ...getTrend(stats.total_contracts_change),
    },
    {
      value: stats.vacant_units, label: 'Vacant Units', icon: icons.alert,
      iconBg: '#FFEDD5', iconColor: '#F97316', ...getTrend(stats.vacant_units_change),
    },
    {
      value: stats.monthly_revenue, label: 'Rent Portfolio (AED)', icon: icons.wallet,
      iconBg: '#CCFBF1', iconColor: '#0D9488', ...getTrend(stats.monthly_revenue_change),
    },
    {
      value: stats.open_complaints, label: 'Open Complaints', icon: icons.wrench,
      iconBg: '#FFE4E6', iconColor: '#F43F5E', ...getTrend(stats.open_complaints_change),
    },
  ]

  // Collection donut is derived from real stats: revenue already invoiced/collected
  // vs. what's still outstanding. Replace with a dedicated backend split if one
  // becomes available (e.g. collected vs. billed for the selected period).
  const totalPortfolio = stats.monthly_revenue + stats.pending_receivables
  const collectedPct = totalPortfolio > 0 ? Math.round((stats.monthly_revenue / totalPortfolio) * 100) : 0
  const pendingPct = 100 - collectedPct

  // Placeholder shape for the portfolio trend line — anchors the final point to
  // the real current monthly revenue. Swap for a real time-series endpoint
  // (e.g. /admin/stats/revenue-trend) when available.
  const trendSeries = useMemo(() => {
    const end = stats.monthly_revenue || 0
    const shape = [0.72, 0.68, 0.78, 0.82, 0.9, 1]
    return shape.map(f => Math.round(end * f))
  }, [stats.monthly_revenue])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: '#F7F8FC' }}>
      <style>{`
        ${portalPageCss}
        .gfh-dash-spinner {
          display: inline-block; width: 22px; height: 22px;
          border: 3px solid rgba(36,0,70,0.15); border-top-color: #6D28D9;
          border-radius: 50%; animation: gfhDashSpin 0.7s linear infinite; margin-bottom: 12px;
        }
        @keyframes gfhDashSpin { to { transform: rotate(360deg); } }
        .gfh-select {
          border: 1px solid #E7E9F1; border-radius: 10px; padding: 6px 10px;
          font-size: 12.5px; font-weight: 600; color: #4B5065; background: #fff;
          font-family: 'Poppins', system-ui, sans-serif; cursor: pointer;
        }
        @media (max-width: 900px) {
          .gfh-dash-grid { grid-template-columns: 1fr !important; }
          .gfh-dash-grid-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
              Dashboard Overview
            </h1>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#0E5E48', background: '#ECFDF8', border: '1px solid #A7F3DC', borderRadius: 8, padding: '4px 10px' }}>
              Live Metrics
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: '#64748B', marginTop: 6, marginBottom: 0, fontWeight: 500 }}>
            Real-time portfolio occupancy, financial performance, and key operations
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#0E5E48',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            padding: '9px 18px',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            opacity: isLoading ? 0.6 : 1,
            boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
            transition: 'all 0.15s ease',
            fontFamily: "'Poppins', sans-serif",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#06382C'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#0E5E48'
          }}
        >
          <Icon path={icons.refresh} size={15} />
          <span>Refresh Data</span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '70px 20px', color: '#8A8FA3', fontWeight: 600 }}>
          <div className="gfh-dash-spinner" />
          <div>Loading dashboard…</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 20 }}>
            {cards.map(card => (
              <StatCard
                key={card.label}
                value={card.value}
                label={card.label}
                active={ready}
                icon={card.icon}
                iconBg={card.iconBg}
                iconColor={card.iconColor}
                trendDirection={card.direction}
                trendPercent={card.percent}
              />
            ))}
          </div>

          {/* Filter bar */}
          <div style={{
            background: '#fff',
            border: '1px solid #F0F1F6',
            borderRadius: 16,
            padding: '14px 18px',
            marginBottom: 20,
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(16,24,40,0.05)',
          }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#15112B' }}>
              Select Unit
            </label>
            <UnitDropdown units={units} value={unitFilter} onChange={setUnitFilter} />
            <button
              type="button"
              aria-label="More filters"
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '1px solid #E7E9F1', background: '#fff', color: '#4B5065',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <Icon path={icons.sliders} size={16} />
            </button>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#8A8FA3', fontWeight: 600 }}>Outstanding receivables</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#DC2626' }}>
                  AED {stats.pending_receivables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <Link
                to="/admin/receivables"
                style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: '#D1FAE5', color: '#059669',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon path={icons.calendar} size={17} />
              </Link>
            </div>
          </div>

          {/* Properties + complaints */}
          <div className="gfh-dash-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 18 }}>
            <div style={{ background: '#fff', border: '1px solid #F0F1F6', borderRadius: 18, padding: '18px 20px', boxShadow: '0 1px 3px rgba(16,24,40,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#15112B' }}>Properties Overview</h3>
                <Link to="/admin/properties" className="gfh-portal-link" style={{ fontSize: 13, color: '#6B21A8', fontWeight: 700, textDecoration: 'none' }}>View all →</Link>
              </div>
              {properties.length === 0 ? (
                <p style={{ color: '#8A8FA3', fontWeight: 500 }}>No properties found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #F0F1F6' }}>
                        {['Property Name', 'City', 'Type', 'Units', 'Occupancy', 'Status'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '0 10px 10px 0', fontSize: 11, fontWeight: 700, color: '#A0A5B8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {properties.slice(0, 6).map((p: any) => {
                        const { total, pct } = getPropertyOccupancy(p.id, units)
                        const statusLabel = total === 0 ? 'Vacant' : 'Active'
                        return (
                          <tr key={p.id} className="gfh-portal-row" style={{ borderBottom: '1px solid #F6F7FA' }}>
                            <td style={{ padding: '12px 10px 12px 0', fontWeight: 700, fontSize: 13.5, color: '#15112B' }}>{p.name}</td>
                            <td style={{ padding: '12px 10px', fontSize: 13, color: '#4B5065' }}>{p.city || '—'}</td>
                            <td style={{ padding: '12px 10px', fontSize: 13, color: '#4B5065' }}>{p.type || '—'}</td>
                            <td style={{ padding: '12px 10px', fontSize: 13, color: '#4B5065' }}>{p.total_units ?? total ?? '—'}</td>
                            <td style={{ padding: '12px 10px' }}><OccupancyBar pct={pct} /></td>
                            <td style={{ padding: '12px 0 12px 10px' }}><StatusBadge label={statusLabel} /></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Link to="/admin/properties" style={{ fontSize: 13, color: '#8A8FA3', fontWeight: 600, textDecoration: 'none' }}>View all properties ↗</Link>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #F0F1F6', borderRadius: 18, padding: '18px 20px', boxShadow: '0 1px 3px rgba(16,24,40,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#15112B' }}>Recent Complaints</h3>
                <Link to="/admin/complaints" className="gfh-portal-link" style={{ fontSize: 13, color: '#6B21A8', fontWeight: 700, textDecoration: 'none' }}>Open all →</Link>
              </div>
              {filteredComplaints.length === 0 ? (
                <p style={{ color: '#8A8FA3', fontWeight: 500 }}>No complaints for this filter.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredComplaints.map((c: any) => {
                    const visual = getComplaintVisual(c.status)
                    const timeLabel = formatComplaintTime(c.created_at)
                    return (
                      <Link
                        key={c.id}
                        to={`/admin/complaints/${c.id}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          border: '1px solid #F0F1F6', borderRadius: 14,
                          padding: '10px 12px', textDecoration: 'none',
                        }}
                      >
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: visual.bg, color: visual.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon path={visual.icon} size={17} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#15112B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                          <div style={{ fontSize: 11.5, color: '#8A8FA3', marginTop: 3 }}>
                            Unit {c.unit?.number || c.unit_id || '—'} · {String(c.status || '').replace(/_/g, ' ')}
                          </div>
                        </div>
                        {timeLabel && (
                          <div style={{ fontSize: 11, color: '#A0A5B8', fontWeight: 600, whiteSpace: 'nowrap' }}>{timeLabel}</div>
                        )}
                        <Icon path={icons.chevronRight} size={14} />
                      </Link>
                    )
                  })}
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Link to="/admin/complaints" style={{ fontSize: 13, color: '#8A8FA3', fontWeight: 600, textDecoration: 'none' }}>View all complaints ↗</Link>
              </div>
            </div>
          </div>

          {/* Collection overview + trend */}
          <div className="gfh-dash-grid-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 18 }}>
            <div style={{ background: '#fff', border: '1px solid #F0F1F6', borderRadius: 18, padding: '18px 20px', boxShadow: '0 1px 3px rgba(16,24,40,0.05)' }}>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#15112B' }}>Rent Collection Overview</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                <DonutChart collectedPct={collectedPct} />
                <div>
                  <div style={{ fontSize: 12, color: '#8A8FA3', fontWeight: 600 }}>Collected</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#15112B', marginTop: 2 }}>
                    AED {stats.monthly_revenue.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: '#A0A5B8', fontWeight: 500, marginTop: 2 }}>
                    {collectedPct}% of total rent portfolio
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#4B5065', fontWeight: 600 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                    Collected <span style={{ fontWeight: 800, color: '#15112B' }}>AED {stats.monthly_revenue.toLocaleString()}</span> ({collectedPct}%)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#4B5065', fontWeight: 600 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#F1F5F9', border: '2px solid #CBD5E1', display: 'inline-block' }} />
                    Pending <span style={{ fontWeight: 800, color: '#15112B' }}>AED {stats.pending_receivables.toLocaleString()}</span> ({pendingPct}%)
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #F0F1F6', borderRadius: 18, padding: '18px 20px', boxShadow: '0 1px 3px rgba(16,24,40,0.05)' }}>
              <div style={{ marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#15112B' }}>Rent Portfolio Trend</h3>
              </div>
              <TrendLineChart data={trendSeries} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}


