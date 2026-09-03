import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface Stats {
  total_properties: number
  total_units: number
  occupied_units: number
  vacant_units: number
  total_contracts: number
  open_complaints: number
  monthly_revenue: number
  pending_receivables: number
}

const icons = {
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1',
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  contracts: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  wallet: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  alert: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0z',
  refresh: 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
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

function StatCard({
  value, label, sub, bg, active, prefix = '', icon,
}: {
  value: number
  label: string
  sub: string
  bg: string
  active: boolean
  prefix?: string
  icon?: string
}) {
  const n = useCountUp(value, active)
  const formatted = `${prefix}${n.toLocaleString()}`
  // Dynamically scale font size so big numbers never collide with the icon
  const fontSize = formatted.length > 8 ? 20 : formatted.length > 6 ? 22 : 26

  return (
    <div style={{
      background: bg,
      color: '#fff',
      borderRadius: 0,
      padding: '18px 16px',
      minHeight: 124,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <div style={{
          fontSize,
          fontWeight: 800,
          lineHeight: 1.15,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.5px',
          wordBreak: 'break-word',
          minWidth: 0,
          flex: 1,
        }}>
          {formatted}
        </div>
        {icon && (
          <div style={{
            background: 'rgba(255,255,255,0.22)',
            width: 32,
            height: 32,
            minWidth: 32,
            minHeight: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0,
            flexShrink: 0,
          }}>
            <Icon path={icon} size={16} />
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        <div style={{
          display: 'inline-block',
          marginTop: 6,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
          background: 'rgba(0,0,0,0.25)',
          padding: '2px 7px',
          borderRadius: 0,
        }}>
          {sub}
        </div>
      </div>
    </div>
  )
}

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
    : 'All units'

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
          padding: '9px 12px',
          border: `1px solid ${THEME.border}`,
          borderRadius: 0,
          background: '#ffffff',
          color: THEME.ink,
          fontWeight: 600,
          fontSize: 13.5,
          fontFamily: "'Poppins', system-ui, sans-serif",
          cursor: 'pointer',
          textAlign: 'left',
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
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            marginLeft: 8,
            transition: 'transform 0.15s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            width: '100%',
            minWidth: 260,
            maxHeight: 250,
            overflowY: 'auto',
            background: '#ffffff',
            border: `1px solid ${THEME.border}`,
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
            zIndex: 999,
            borderRadius: 0,
            fontFamily: "'Poppins', system-ui, sans-serif",
          }}
        >
          <div
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            style={{
              padding: '9px 12px',
              fontSize: 13,
              fontWeight: value === '' ? 700 : 500,
              color: value === '' ? '#6B21A8' : '#334155',
              background: value === '' ? '#f1f5f9' : '#ffffff',
              cursor: 'pointer',
              borderBottom: '1px solid #f1f5f9',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.background = value === '' ? '#f1f5f9' : '#ffffff')}
          >
            All units
          </div>
          {units.map((u: any) => {
            const isSelected = String(u.id) === String(value)
            return (
              <div
                key={u.id}
                onClick={() => {
                  onChange(String(u.id))
                  setIsOpen(false)
                }}
                style={{
                  padding: '9px 12px',
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#6B21A8' : '#334155',
                  background: isSelected ? '#f1f5f9' : '#ffffff',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f8fafc',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = isSelected ? '#f1f5f9' : '#ffffff')}
              >
                Unit {u.number || u.id}{u.property?.name ? ` · ${u.property.name}` : ''}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

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
      setStats({
        total_properties: props.length,
        total_units: unitList.length,
        occupied_units: occupied,
        vacant_units: vacant,
        total_contracts: contracts.length,
        open_complaints: complaints.filter((c: any) => c.status === 'open' || c.status === 'in_progress').length,
        monthly_revenue: totalRevenue,
        pending_receivables: totalReceivables,
      })
      setRecentComplaints(complaints.slice(0, 8))
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
    { value: stats.total_properties, label: 'Total Properties', sub: 'Portfolio', bg: '#240046', icon: icons.building },
    { value: stats.occupied_units, label: 'Rented / Occupied', sub: 'Units', bg: '#065f46', icon: icons.door },
    { value: stats.total_contracts, label: 'Active Bookings', sub: 'Contracts', bg: '#075985', icon: icons.contracts },
    { value: stats.vacant_units, label: 'Vacant Units', sub: 'Available', bg: '#991b1b', icon: icons.alert },
    { value: stats.monthly_revenue, label: 'Rent Portfolio', sub: 'AED', bg: '#0e7490', prefix: '', icon: icons.wallet },
    { value: stats.open_complaints, label: 'Open Complaints', sub: 'Ops', bg: '#b45309', icon: icons.wrench },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: '#F8F7FD' }}>
      <style>{`
        ${portalPageCss}
        .gfh-dash-spinner {
          display: inline-block; width: 22px; height: 22px;
          border: 3px solid rgba(36,0,70,0.2); border-top-color: #240046;
          border-radius: 0%; animation: gfhDashSpin 0.7s linear infinite; margin-bottom: 12px;
        }
        @keyframes gfhDashSpin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .gfh-dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Rental Management Overview</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Live metrics from properties, units, contracts & receivables</div>
        </div>
        <button type="button" className="gfh-portal-btn" onClick={fetchDashboardData} disabled={isLoading} style={{ ...ghostBtnStyle, background: '#240046', opacity: isLoading ? 0.6 : 1 }}>
          <Icon path={icons.refresh} size={15} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '70px 20px', color: THEME.textMuted, fontWeight: 600 }}>
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
                sub={card.sub}
                bg={card.bg}
                active={ready}
                prefix={card.prefix}
                icon={card.icon}
              />
            ))}
          </div>

          {/* Search / filter bar — client-side filter on loaded complaints */}
          <div style={{
            background: '#fff',
            border: `1px solid ${THEME.border}`,
            borderRadius: 0,
            padding: '14px 16px',
            marginBottom: 20,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              Select Unit
            </label>
            {/* Custom dropdown — always opens downward */}
            <UnitDropdown
              units={units}
              value={unitFilter}
              onChange={setUnitFilter}
            />
            <div style={{ marginLeft: 'auto', fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>
              Outstanding receivables: <span style={{ color: ADMIN_COLORS.red, fontWeight: 800 }}>AED {stats.pending_receivables.toLocaleString()}</span>
            </div>
          </div>

          <div className="gfh-dash-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
            <div style={{ ...panelStyle, borderRadius: 0, minHeight: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: THEME.ink }}>Properties</h3>
                <Link to="/admin/properties" className="gfh-portal-link" style={{ fontSize: 13, color: '#6B21A8', fontWeight: 700 }}>View all →</Link>
              </div>
              {properties.length === 0 ? (
                <p style={{ color: THEME.textMuted, fontWeight: 500 }}>No properties found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                        {['Name', 'City', 'Type', 'Units'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {properties.slice(0, 6).map((p: any) => (
                        <tr key={p.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>{p.name}</td>
                          <td style={tdStyle}>{p.city || '—'}</td>
                          <td style={tdStyle}>{p.type || '—'}</td>
                          <td style={tdStyle}>{p.total_units ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ ...panelStyle, borderRadius: 0, minHeight: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: THEME.ink }}>Recent Complaints</h3>
                <Link to="/admin/complaints" className="gfh-portal-link" style={{ fontSize: 13, color: '#6B21A8', fontWeight: 700 }}>Open →</Link>
              </div>
              {filteredComplaints.length === 0 ? (
                <p style={{ color: THEME.textMuted, fontWeight: 500 }}>No complaints for this filter.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredComplaints.map((c: any) => (
                    <div key={c.id} style={{
                      border: `1px solid ${THEME.border}`,
                      borderLeft: `4px solid ${c.status === 'resolved' || c.status === 'closed' ? ADMIN_COLORS.green : ADMIN_COLORS.amber}`,
                      borderRadius: 0,
                      padding: '10px 12px',
                      background: '#fff',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: THEME.ink }}>{c.title}</div>
                      <div style={{ fontSize: 11.5, color: THEME.textMuted, marginTop: 4 }}>
                        Unit {c.unit?.number || c.unit_id || '—'} · {String(c.status || '').replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}