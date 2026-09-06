import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle, RADIUS } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

interface UnitRow {
  id: number
  number: string
  floor: number
  type: string
  status: string
  price: number
  propertyName: string
}

const icons = {
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  check: 'M20 6 9 17l-5-5',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  AVAILABLE: { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
  OCCUPIED:  { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  BOOKED:    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
}

export default function OwnerUnits() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [units, setUnits] = useState<UnitRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const searchQuery = searchParams.get('q') || ''
  const [propertyFilter, setPropertyFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('NUMBER_ASC')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const propsRes = await api.get('/owner/dashboard/properties')
        const properties = propsRes.data?.data?.properties || []
        const rows: UnitRow[] = []

        for (const prop of properties) {
          const unitsRes = await api.get(`/owner/dashboard/properties/${prop.id}/units`)
          const list = unitsRes.data?.data?.units || []
          for (const u of list) {
            rows.push({
              id: u.id,
              number: u.number,
              floor: u.floor,
              type: u.type,
              status: u.status,
              price: Number(u.price),
              propertyName: prop.name,
            })
          }
        }

        setUnits(rows)
      } catch (err) {
        console.error(err)
        setError('Failed to load units.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // Unique properties and types
  const propertyOptions = useMemo(() => {
    return Array.from(new Set(units.map(u => u.propertyName).filter(Boolean)))
  }, [units])

  const typeOptions = useMemo(() => {
    return Array.from(new Set(units.map(u => u.type).filter(Boolean)))
  }, [units])

  // Filtered and sorted units
  const filteredUnits = useMemo(() => {
    return units
      .filter(u => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchNum = (u.number || '').toLowerCase().includes(q)
          const matchProp = (u.propertyName || '').toLowerCase().includes(q)
          const matchType = (u.type || '').toLowerCase().includes(q)
          const matchFloor = String(u.floor || '').includes(q)
          if (!matchNum && !matchProp && !matchType && !matchFloor) return false
        }
        if (propertyFilter !== 'ALL' && u.propertyName !== propertyFilter) return false
        if (statusFilter !== 'ALL' && u.status !== statusFilter) return false
        if (typeFilter !== 'ALL' && (u.type || '').toLowerCase() !== typeFilter.toLowerCase()) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'NUMBER_ASC') return (a.number || '').localeCompare(b.number || '', undefined, { numeric: true })
        if (sortBy === 'PROP_ASC') return (a.propertyName || '').localeCompare(b.propertyName || '')
        if (sortBy === 'PRICE_DESC') return b.price - a.price
        if (sortBy === 'PRICE_ASC') return a.price - b.price
        if (sortBy === 'FLOOR_ASC') return a.floor - b.floor
        return 0
      })
  }, [units, searchQuery, propertyFilter, statusFilter, typeFilter, sortBy])

  const occupied = filteredUnits.filter(u => u.status === 'OCCUPIED').length
  const vacant = filteredUnits.filter(u => u.status === 'AVAILABLE').length

  const hasActiveFilters = Boolean(
    searchQuery.trim() || propertyFilter !== 'ALL' || statusFilter !== 'ALL' || typeFilter !== 'ALL' || sortBy !== 'NUMBER_ASC'
  )

  const clearAllFilters = () => {
    setSearchParams({}, { replace: true })
    setPropertyFilter('ALL')
    setStatusFilter('ALL')
    setTypeFilter('ALL')
    setSortBy('NUMBER_ASC')
  }

  const stats = [
    {
      value: filteredUnits.length,
      label: 'Units Found',
      sub: 'Units',
      icon: icons.door,
      iconBg: '#ECFDF8',
      iconColor: '#0E5E48',
      badgeBg: '#ECFDF8',
      badgeColor: '#065F46',
      badgeBorder: '#A7F3DC',
    },
    {
      value: occupied,
      label: 'Occupied Units',
      sub: 'Occupied',
      icon: icons.check,
      iconBg: '#F0FDF4',
      iconColor: '#0F8A67',
      badgeBg: '#F0FDF4',
      badgeColor: '#065F46',
      badgeBorder: '#BBF7D0',
    },
    {
      value: vacant,
      label: 'Available Units',
      sub: 'Vacant',
      icon: icons.alert,
      iconBg: vacant > 0 ? '#FEF2F2' : '#F0F9FF',
      iconColor: vacant > 0 ? '#DC2626' : '#0284C7',
      badgeBg: vacant > 0 ? '#FEF2F2' : '#F0F9FF',
      badgeColor: vacant > 0 ? '#991B1B' : '#075985',
      badgeBorder: vacant > 0 ? '#FECACA' : '#BAE6FD',
    },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, margin: 0 }}>My Units</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
            Search and filter all units across your property portfolio
          </div>
        </div>
        <Link to="/owner/dashboard" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#0E5E48', borderRadius: 8 }}>
          ← Back to dashboard
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
        {stats.map((card, i) => (
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
                {isLoading ? '—' : card.value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="fade-in"
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: 1, minWidth: 280 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
            <svg
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                const val = e.target.value
                setSearchParams(val ? { q: val } : {}, { replace: true })
              }}
              placeholder="Search units by number, property, floor..."
              style={{
                width: '100%',
                padding: searchQuery ? '9px 30px 9px 34px' : '9px 12px 9px 34px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                fontSize: 13,
                color: '#0F172A',
                outline: 'none',
                fontFamily: "'Poppins', system-ui, sans-serif",
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 3,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 12,
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Property Filter */}
          <select
            value={propertyFilter}
            onChange={e => setPropertyFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              fontFamily: "'Poppins', system-ui, sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Properties</option>
            {propertyOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              fontFamily: "'Poppins', system-ui, sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="BOOKED">Booked</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              fontFamily: "'Poppins', system-ui, sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Unit Types</option>
            {typeOptions.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              fontFamily: "'Poppins', system-ui, sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="NUMBER_ASC">Sort: Unit Number</option>
            <option value="PROP_ASC">Sort: Property Name</option>
            <option value="PRICE_DESC">Sort: Rent (High to Low)</option>
            <option value="PRICE_ASC">Sort: Rent (Low to High)</option>
            <option value="FLOOR_ASC">Sort: Floor</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #FECACA',
              background: '#FEF2F2',
              color: '#991B1B',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>✕</span> Reset filters
          </button>
        )}
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 320 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#991b1b', fontWeight: 600 }}>{error}</div>
        ) : units.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No units found in your portfolio.</p>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px dashed #CBD5E1' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FEF2F2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon path={icons.alert} size={22} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>No units match your search</p>
            <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 14px 0' }}>
              Try adjusting or clearing your search and filters.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#0E5E48',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Property', 'Unit', 'Type', 'Floor', 'Status', 'Rent (AED)', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((u) => {
                  const st = STATUS_STYLE[u.status] || { bg: '#f3f4f6', color: '#374151' }
                  return (
                    <tr key={u.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{u.propertyName}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{u.number}</td>
                      <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{u.type}</td>
                      <td style={tdStyle}>{u.floor}</td>
                      <td style={tdStyle}>
                        <span style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border || '#d1d5db'}`, padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, display: 'inline-block' }}>
                          {safeUpper(u.status)}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#065f46' }}>{u.price.toLocaleString()}</td>
                      <td style={tdStyle}>
                        <Link to={`/owner/units/${u.id}`} className="gfh-portal-link" style={{ color: '#0E5E48' }}>View details →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
